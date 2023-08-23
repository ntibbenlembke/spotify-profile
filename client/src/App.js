import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import { catchErrors } from './utils';
import { GlobalStyle } from './styles';
import styled from 'styled-components/macro';

const StyledLoginButton = styled.a`
  background-color: var(--green);
  color: var(--white);
  padding: 10px 20px;
  margin: 20px auto;
  border-radius: 30px;
  display: inline-block;
`;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0,0);
  }, [pathname]);

  return null;
}

function App() {
  const [token, setToken] = useState(null);
  const [profile, setProfile ] = useState(null);
  
  useEffect(() => {
    setToken(accessToken);
    
    const fetchData = async () => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);
    };

    catchErrors(fetchData());

  }, []);


  return (
    <div className="App">
      <GlobalStyle />
      <header className="App-header">
        {!token ? (
        <StyledLoginButton
          href="http://localhost:8888/login"
        >
          Log in to Spotify
        </StyledLoginButton>
        ) : (
          <Router>
            <ScrollToTop/>

            <Routes>
              <Route path="/top-artists" element={<Artists />}/>

              <Route path="/top-tracks" element={<Tracks />}/>
                
              <Route path="/playlists/:id" element={<ID />}/>

              <Route path="/playlists" element={<Playlists />}/>
              
              <Route path="/" element={<Home />} />
            </Routes>
          </Router>
        )}
      </header>
    </div>
  );
};

function Home() {
  const [token, setToken] = useState(null);
  const [profile, setProfile ] = useState(null);

  useEffect(() => {
    setToken(accessToken);
    const fetchData = async () => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);
    };
    catchErrors(fetchData());
  }, []);

  return (
    <div>
      <>
        <button onClick={logout}>Log Out</button>
         {profile && (
          <div>
            <h1>{profile.display_name}</h1>
            <p>{profile.followers.total} Followers</p>
            {profile.images.length && profile.images[1].url && (
              <img src={profile.images[1].url} alt="Avatar"/>
            )}
          </div>
        )}
      </>
    </div>
  );
};

function Artists() {
  return (
    <div>
      <h1>Top Artists</h1> 
    </div>
  );
};

function Tracks() {
  return (
    <div>
      <h1>Top Tracks</h1> 
    </div>
  );
};

function ID() {
  return (
    <div>
      <h1>Playlist</h1> 
    </div>
  );
};

function Playlists() {
  return (
    <div>
      <h1>Playlists</h1> 
    </div>
  );
};


export default App;

