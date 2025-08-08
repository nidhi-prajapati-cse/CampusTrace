import Header from '../components/Header';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import RecentItems from '../components/RecentItems';
import Footer from '../components/Footer';
import './home.css';
const Home = () => {
  return (
    <div className='home-container'>
    <Header />
      <div className='home-content'>
      <Hero />
      <SearchBar />
      <RecentItems />
      <Footer />
      </div>
    </div>
  );
};

export default Home;
