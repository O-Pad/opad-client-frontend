import React from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './OpadEditor.scss';
import {Close, Add} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import {Button} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

class OpadEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open_files: ['hello','file2'],
            current_file: 'hello',
            content: ['hello world', '', '', 'hello'],
            cursor_position: [0, 3]
        }
        this.getFile = this.getFile.bind(this)
        this.create = this.create.bind(this)
        this.close = this.close.bind(this)
        this.selectTab = this.selectTab.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.getFile();
    }

    componentDidMount() {
        this.timer = setInterval(()=> this.getFile(), 5000);
        document.addEventListener("keydown", this.handleKeyPress);
    }
    
    componentWillUnmount() {
        clearInterval(this.timer)
        this.timer = null;
        document.removeEventListener("keydown", this.handleKeyPress);
    }
    
    getFile() {
        const axios = require('axios');
        axios.get(`http://localhost:4000/fetch-file?filename=${this.state.current_file}`)
            .then(result =>  this.setState({content: result.data.content}));
    }

    handleKeyPress(event) {
        var line = this.state.cursor_position[0];
        var pos = this.state.cursor_position[1];
        var newline = line;
        var newpos = pos;
        if (event.key === 'ArrowRight') {
            newline = line;
            newpos = Math.min(this.state.content[newline].length, pos + 1);
        }
        else if (event.key === 'ArrowLeft') {
            newline = line;
            newpos = Math.max(0, pos - 1);
        }
        else if (event.key === 'ArrowUp') {
            newline = Math.max(0, line - 1);
            newpos = Math.min(this.state.content[newline].length, pos);            
        }
        else if (event.key === 'ArrowDown') {
            newline = Math.min(this.state.content.length - 1, line + 1);
            newpos = Math.min(this.state.content[newline].length, pos);            
        }
        else if (event.key === 'Enter') {
            const axios = require('axios');
            axios.get(`http://localhost:4000/add-line?filename=${this.state.current_file}&line=${line}`)
                .then((result) =>  {
                    newline = Math.min(this.state.content.length - 1, line + 1);
                    newpos = Math.min(this.state.content[newline].length, pos);
                    this.setState({content : result.data.content, cursor_position: [newline, newpos]});
                });

        }
        else if (event.key.length == 1){
            const axios = require('axios');
            axios.get(`http://localhost:4000/add-char?filename=${this.state.current_file}&key=${event.key}&line=${line}&pos=${pos}`)
                .then((result) =>  {
                    var line = this.state.cursor_position[0];
                    var pos = this.state.cursor_position[1];
                    this.setState({content : result.data.content, cursor_position: [line, pos + 1]});
                });
        }
        else if (event.key === 'Backspace') {
            if(pos == 0) {
                if(line == 0) return;
                const axios = require('axios');
                axios.get(`http://localhost:4000/delete-line?filename=${this.state.current_file}&line=${line - 1}`)
                    .then((result) =>  {
                        newline = Math.max(0, line - 1);
                        newpos = Math.min(this.state.content[newline].length, pos);
                        this.setState({content : result.data.content, cursor_position: [newline, newpos]});
                    });    
            }
            const axios = require('axios');
            axios.get(`http://localhost:4000/delete-char?filename=${this.state.current_file}&line=${line}&pos=${Math.max(0, pos - 1)}`)
                .then((result) =>  {
                    var line = this.state.cursor_position[0];
                    var pos = this.state.cursor_position[1];
                    this.setState({content : result.data.content, cursor_position: [line, Math.max(0, pos - 1)]});
                });
        }
        this.setState({cursor_position: [newline, newpos]})
    }

    create() {
        var filename = "newfile2"
        const axios = require('axios');
        axios.get(`http://localhost:4000/create-file?filename=${filename}`)
            .then(result =>  {
                console.log(result)
                if(result.data.status == 'success') {
                    this.setState({open_files: [...this.state.open_files, filename], current_file: filename, content: ""})
                    this.setState({alert_message: 'file creation successful', alert_severity: 'success'})
                } else {
                    this.setState({alert_message: result.data.status, alert_severity: 'error'})
                }
            });
    }

    close() {
        console.log('close');
    }

    selectTab(id) {
        this.setState({current_file : id})
    }

    render() {
        return (
        <div className="OpadEditor">
             <div className="tabs">
                {this.state.open_files.map((file) =>(
                    <div className={`tab ${file == this.state.current_file ? "selected" : ""}`} onClick={() => this.selectTab(file)}>
                        <div className="tab-name">{file}</div>
                        <IconButton className="close" onClick={this.create}> 
                            <Close />
                        </IconButton>
                    </div>))
                }
                <div className="tab">
                    <IconButton className="add" onClick={this.create}> 
                        <Add />
                    </IconButton>      
                </div>                      
            </div>

           {this.state.open_files.length > 0 ? (
                <div id="editor" className="body" focus >
                    {this.state.content.map((line, id) => {
                        var prefix = line.substr(0, this.state.cursor_position[1]);
                        var suffix = line.substr(this.state.cursor_position[1]);
                        return (<div id={`line-${id}`} className={`line ${this.state.cursor_position[0] == id ? " focus" : ""}`} >
                                <div className="lineno">{id}</div>
                                <div className="text">{prefix}</div>
                                <div className={`cursor ${this.state.cursor_position[0] == id ? " show" : ""}`}>{"|"}</div>
                                <div className="text">{suffix}</div>
                                </div>)
                    })}
                    {/* <Editor
                        value={this.state.content}
                        onValueChange={this.handleInput}
                        highlight={code => highlight(code, languages.js)}
                        padding={10}
                    />                     */}
                </div>
            ) : (
                <div>
                    <Button>Create new file</Button>
                    <Button>Open file</Button>
                </div>
            )}
        {this.state.alert_severity ? <Alert severity={this.state.alert_severity}>{this.state.alert_message}</Alert> : ""}
        </div>
        );
    }
}
 
export default OpadEditor;