// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from 'behavior/store'; // Make sure the path to your store file is correct
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling

// Get the root DOM element
const container = document.getElementById('root');
if (!container) {
  throw new Error("Couldn't find root element with id 'root'");
}


// Create a root and render the App
const root = createRoot(container);
root.render(
  <div style={{ height: "100vh" }}>

    <Provider store={store}>
      <App />
    </Provider>
  </div>
);
