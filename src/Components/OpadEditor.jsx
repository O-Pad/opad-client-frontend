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
            content: 'hello world'
        }
        this.getFile = this.getFile.bind(this)
        this.handleInput = this.handleInput.bind(this)
        this.create = this.create.bind(this)
        this.close = this.close.bind(this)
        this.selectTab = this.selectTab.bind(this)
    }

    componentDidMount() {
        this.timer = setInterval(()=> this.getFile(), 5000);
    }
    
    componentWillUnmount() {
        clearInterval(this.timer)
        this.timer = null;
    }
    
    getFile() {
        const axios = require('axios');
        axios.get(`http://localhost:4000/fetch-file?filename=${this.state.current_file}`)
            .then(result =>  this.setState({content: result.data.content}));
    }

    handleInput(value) {
        console.log(value)
        this.setState({content: value});
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
                <div className="body">
                    <Editor
                        value={this.state.content}
                        onValueChange={this.handleInput}
                        highlight={code => highlight(code, languages.js)}
                        padding={10}
                        style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        minHeight: "calc(90vh - 32px)"
                    }}
                    />                    
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