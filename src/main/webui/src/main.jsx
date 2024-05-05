import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {QueryClient, QueryClientProvider} from "react-query";
import {AuthProvider, ThemeProvider} from "./Context.jsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <App/>
            </QueryClientProvider>
        </AuthProvider>
    </ThemeProvider>
)
