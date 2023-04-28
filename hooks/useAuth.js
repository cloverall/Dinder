import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@firebase/auth'
import * as Google from 'expo-google-app-auth'
import { auth } from '../firebase'
// import * as AuthSession from 'expo-auth-session'

const AuthContext = createContext({})

const config = {
    androidClientId: '898054924165-34jj9u5k0mlgh9ku2gk04btutqbj2ai5.apps.googleusercontent.com',
    iosClientId: '898054924165-iucbbr3m02n2mgidoetc4785i8kacfq2.apps.googleusercontent.com',
    scopes: ["profile", "email"],
    permissions: ["public_profile", "email", "gender", "location"],
}

export const FirebaseAuth = ({ children }) => {
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [loadingInitial, setLoadingInitial] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(
        () =>
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // Logged in
                    setUser(user)
                } else {
                    setUser(null)
                }

                setLoadingInitial(false)
            }),
        []
    )

    const logout = async () => {
        setLoading(true)

        signOut(auth)
            .catch((error) => setError(error))
            .finally(() => setLoading(false))
    }

    const signInWithGoogle = async () => {
        setLoading(true)

        await Google.logInAsync(config).then(async (logInResult) => {
            if (logInResult.type === 'success') {
                //login
                const { idToken, accessToken } = logInResult
                const credential = GoogleAuthProvider.credential(idToken, accessToken)

                await signInWithCredential(auth, credential)
            }
            return Promise.reject()
        }).catch(error => setError(error))
            .finally(() => setLoading(false))
    }

    const memoedValue = useMemo(() => ({
        user,
        loading,
        error,
        signInWithGoogle, // x: x,
        logout,
    }),
        [user, loading, error]
    )

    return (
        <AuthContext.Provider value={memoedValue}>
            {!loadingInitial && children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext)
}