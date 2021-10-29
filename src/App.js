import logo from './logo.svg';
import './App.css';
import React from 'react';
import Editor from './Components/OpadEditor';

class App extends React.Component {
  render() { 
    return (
      <div className="App">
        <header className="App-header">   
        OPad Client
        </header>
        <Editor />
      </div>
    );
  }
}
 
export default App;

