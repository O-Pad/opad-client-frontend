import React from "react";
import './OpadEditor.scss';
import {Close, Add} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import {Button, Icon} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

class OpadEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open_files: [],
            current_file: null,
            content: null,
            popup: true,
            clock: 0
        }
        this.getFile = this.getFile.bind(this)
        this.create = this.create.bind(this)
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
        this.selectTab = this.selectTab.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.getFile();
        this.BACKENDURL = 'http://localhost:4000';
    }

    componentDidMount() {
        this.timer = setInterval(()=> this.getFile(), 500);
        document.addEventListener("keydown", this.handleKeyPress);
    }
    
    componentWillUnmount() {
        clearInterval(this.timer)
        this.timer = null;
        document.removeEventListener("keydown", this.handleKeyPress);
    }
    
    getFile() {
        if(this.state.current_file == null) {
            const axios = require('axios');
            axios.get(this.BACKENDURL + `/get-file-list`)
            .then(result =>  {
                console.log(result.data.open_files)
                this.setState({open_files: result.data.open_files})
                if(result.data.open_files.length != 0)
                    this.setState({current_file: result.data.open_files[0], content: ""});   
            });
        }

        if(this.state.current_file != null){
            const axios = require('axios');
            axios.get(this.BACKENDURL + `/fetch-file?filename=${this.state.current_file}`)
            .then(result =>  this.setState({clock: result.data.clock, content: result.data.content.substr(0, result.data.cursor) + '|' + result.data.content.substr(result.data.cursor)}));
        }
    }

    handleKeyPress(event) {
        if(this.state.current_file == null || this.state.popup) return;
        const axios = require('axios');
        axios.get(this.BACKENDURL + `/key-press?filename=${this.state.current_file}&key=${event.key == ' ' ? 'Space' : event.key}`)
        .then(result =>  this.setState({content: result.data.content.substr(0, result.data.cursor) + '|' + result.data.content.substr(result.data.cursor)}));
    }

    create() {
        var filename = document.getElementById('createFileName').value
        if(filename == '') {
            this.setState({alert_severity: 'error', alert_message: 'Please enter file name'})
            return;
        }
        const axios = require('axios');
        axios.post(this.BACKENDURL + `/create-file?filename=${filename}`, this.uploadInput.files ? this.uploadInput.files[0] : null)
            .then(result =>  {
                console.log(result)
                if(result.data.status == 'success') {
                    this.setState({open_files: [...this.state.open_files, filename], current_file: filename, content: result.data.content})
                    this.setState({alert_message: `File Created Successfully. File secret key is ${result.data.key}.`, alert_severity: 'success'})
                } else {
                    this.setState({alert_message: result.data.status, alert_severity: 'error'})
                }
            });
    }

    open() {
        var filename = document.getElementById('openFileID').value
        if(filename == '') {
            this.setState({alert_severity: 'error', alert_message: 'Please enter File Secret Key'})
            return;
        }
        const axios = require('axios');
        axios.get(this.BACKENDURL + `/open-file?filename=${filename}`)
            .then(result =>  {
                if(result.data.status == 'success') {
                    this.setState({open_files: [...this.state.open_files, filename], current_file: filename, content: result.data.content, popup: false})
                } else {
                    this.setState({alert_message: result.data.status, alert_severity: 'error'})
                }
            });
    }

    close() {
        var filename = this.state.current_file
        const axios = require('axios');
        axios.get(this.BACKENDURL + `/close-file?filename=${filename}`)
            .then(result =>  {
                if(result.data.status == 'success') {
                    var updated_files = this.state.open_files.filter((file) => file != filename);
                    this.setState({open_files: updated_files, current_file: updated_files.length ? updated_files[0] : null, content: ""});
                } else {
                    this.setState({alert_message: result.data.status, alert_severity: 'error'})
                }
            });
    }

    selectTab(id) {
        this.setState({current_file : id})
    }

    render() {
        return (
        <div className="OpadEditor">
            <div className={`popup ${this.state.popup ? `open` : ``}`}>
                <IconButton className="close" onClick={() => this.setState({popup: false})}>
                    <Close />
                </IconButton>
                <div>
                    {'File Name:'}
                    <input id="createFileName" type="text" />
                </div>
                <div>
                    {'File Data (Optional):'}
                    <input ref={(ref) => { this.uploadInput = ref; }} type="file" id="file" />
                </div>
               <Button className="newFile" onClick={this.create}>Create new file</Button>
                {'or'}
                <div>
                    {'File Secret Key:'}
                    <input id="openFileID" type="text" />
                </div>
                <Button className="newFile" onClick={this.open}>Open file</Button>
                {this.state.alert_severity ? <Alert severity={this.state.alert_severity}>{this.state.alert_message}</Alert> : ""}
            </div>
            <div>Clock: {this.state.clock}</div>
             <div className="tabs">
                {this.state.open_files.map((file) =>(
                    <div className={`tab ${file == this.state.current_file ? "selected" : ""}`} onClick={() => this.selectTab(file)}>
                        <div className="tab-name">{file}</div>
                        <IconButton className="close" onClick={this.close}> 
                            <Close />
                        </IconButton>
                    </div>))
                }
                <div className="tab">
                    <IconButton className="add" onClick={() => this.setState({popup : true})}> 
                        <Add />
                    </IconButton>      
                </div>                      
            </div>

           {this.state.current_file != null ? (
                <div className="body" focus >
                    {this.state.content.split('\n').map((line, id) => (
                        <div className="line">
                            <div className="lineno">{id}</div>
                            {line}
                        </div>
                    ))}
                </div>
            ) : (
                // <div>
                //     <Button>Create new file</Button>
                //     <Button>Open file</Button>
                // </div>
                ""
            )}
        </div>
        );
    }
}
 
export default OpadEditor;