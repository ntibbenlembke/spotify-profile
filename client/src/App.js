import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import { catchErrors } from './utils';
import { GlobalStyle } from './styles';
import { Login, Profile, TopArtists, TopTracks, Playlists, Playlist } from './pages';
import styled from 'styled-components/macro';

const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0,0,0,.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
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
          <Login />
        ) : (
          <>
          <StyledLogoutButton onClick={logout}>Log Out</StyledLogoutButton>

          <Router>
            <ScrollToTop/>

            <Routes>
              <Route path="/top-artists" element={<Artists />}/>

              <Route path="/top-tracks" element={<Tracks />}/>
                
              <Route path="/playlists/:id" element={<ID />}/>

              <Route path="/playlists" element={<PlaylistsPage />}/>
              
              <Route path="/" element={<Home />} />
            </Routes>
          </Router>
          </>
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
      <Profile/>
    </div>
  );
};

function Artists() {
  return (
    <div>
      <TopArtists />
    </div>
  );
};

function Tracks() {
  return (
    <div>
      <TopTracks />
    </div>
  );
};

function ID() {
  return (
    <div>
      <Playlist /> 
    </div>
  );
};

function PlaylistsPage() {
  return (
    <div>
      <Playlists /> 
    </div>
  );
};


export default App;

