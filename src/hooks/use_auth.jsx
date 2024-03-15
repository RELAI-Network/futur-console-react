import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { getDocument } from 'src/services/firebase/firestore/helpers';
import { usersCollection } from 'src/services/firebase/firestore/constants';

import { useLocalStorage } from './use-local-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);

  const [status, setStatus] = useState('idle');

  const [firestoreUser, setFirestoreUser] = useState(null);

  const retrieveFirebaseUser = useCallback(
    (uid) => {
      setStatus('pending');

      getDocument(usersCollection, uid)
        .then((data) => {
          setFirestoreUser(data);

          setStatus('success');
        })
        .catch(() => {
          setStatus('error');
        });
    },
    [setFirestoreUser]
  );

  useEffect(() => {
    if (status === 'idle') {
      if (user === null) {
        setStatus('success');
      } else {
        retrieveFirebaseUser(user.uid);
      }
    }
  }, [retrieveFirebaseUser, status, user]);

  const navigate = useNavigate();

  const login = useCallback(
    async (data) => {
      setUser(data);
      navigate('/');
    },
    [navigate, setUser]
  );

  const logout = useCallback(async () => {
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate, setUser]);

  const value = useMemo(
    () => ({
      status,
      user :  {
        ...(user ?? {}),
        ...(firestoreUser ?? {}),
        paidDeveloperFee: firestoreUser?.paid_developer_fee ?? false,
      },
      firestoreUser,
      login,
      logout,
    }),
    [status, user, firestoreUser, login, logout]
  );

  console.log(value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.any,
};
