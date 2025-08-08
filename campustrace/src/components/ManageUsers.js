import './manageusers.css';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Loading from './Loading';
import Error from './Error';
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const[error,setError]=useState(false);
  const[message,setMessage]=useState("");

  useEffect(() => {
    window.scrollTo(0, 0); 
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users'); 
        setUsers(res.data.users || []); // ✅ Make sure your backend returns { users: [...] }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(true);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  
  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/users/${id}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(user => user._id !== id));
        setMessage('User deleted successfully!');
      } else {
       setMessage('Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage('Server error while deleting user.');
    }
  };

  if (loading) return <Loading/>;
  if(error){
    return(
      <div className="admin-page">
      <h2>Manage Users</h2>
      <Error/>
      </div>
    )
  }
  return (
    <div className="admin-page">
      <h2>Manage Users</h2>
      {users.length === 0 ? (
        <div className='noreport-text'>
          <h3>No users found</h3>
        </div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Contact</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className='tabletext'>{user._id}</td>
                <td className='tabletext'>{user.name}</td>
                <td className='tabletext'>{user.email}</td>
                <td>
                  <button className="contact-button">
                    <FontAwesomeIcon icon={faMessage} />
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setUserToDelete(user._id);
                      setIsConfirmOpen(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isConfirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setIsConfirmOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <p className='confirm-msg'>Are you sure you want to delete this user?</p>
            <div className="confirm-buttons">
              <button className="yes-button" onClick={() => {
                handleDelete(userToDelete); 
                setIsConfirmOpen(false);
              }}>Yes</button>
              <button className="no-button" onClick={() => setIsConfirmOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {message != "" && <div className="confirm-overlay">
                    <div className="confirm-modal">
                      <span className="confirm close-button" onClick={() => setMessage("")}>
                        <FontAwesomeIcon icon={faTimes} className='dark-close' />
                      </span>
                      <p className='confirm-msg'>{message}</p>
                      <div className="confirm-buttons">
                        <button className="no-button" onClick={() => setMessage("")}>OK</button>
                      </div>
                    </div>
                  </div>}
    </div>
  );
};

export default ManageUsers;
