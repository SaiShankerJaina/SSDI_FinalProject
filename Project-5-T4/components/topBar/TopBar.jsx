import React from 'react';
import { AppBar, Toolbar, Typography,Button, Divider, Box, Alert, Snackbar,  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,  Select, MenuItem, Chip } from '@mui/material';
import './TopBar.css';
import axios from 'axios';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: null,
      photo_upload_show: false,
      photo_upload_error: false,
      photo_upload_success: false,
      openDeleteConfirm: false,
      sharingList: [],
      allUsers: [], 
      sharingDialogOpen: false,
    };

    this.handleLogout = this.handleLogout.bind(this);
    this.handleNewPhoto = this.handleNewPhoto.bind(this);
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    this.handleOpenDeleteConfirm = this.handleOpenDeleteConfirm.bind(this);
    this.handleCloseDeleteConfirm = this.handleCloseDeleteConfirm.bind(this);
    this.toggleSharingDialog = this.toggleSharingDialog.bind(this);
    this.handleSharingListChange = this.handleSharingListChange.bind(this);
    this.fetchAllUsers = this.fetchAllUsers.bind(this);
    
  }

  componentDidMount() {
    this.handleAppInfoChange();
  }

  fetchAllUsers() {
    axios.get('/user/list')
      .then(response => this.setState({ allUsers: response.data }))
      .catch(error => console.error('Error fetching all users:', error));
  }

  handleLogout = (user) => {
    axios.post("/admin/logout")
        .then((response) =>
        {
          this.props.changeUser(undefined);
          console.log(response);
        })
        .catch( error => {
            this.props.changeUser(undefined);
            console.log(error,user);
        });
  };

 handleNewPhoto(event) {
   event.preventDefault();

    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      domForm.append('sharingList', JSON.stringify(this.state.sharingList));
      
      axios.post("/photos/new", domForm)
        .then(() => {
          this.setState({
            photo_upload_show: true,
            photo_upload_success: true,
            photo_upload_error: false
          });
        })
        .catch(() => {
          this.setState({
            photo_upload_show: true,
            photo_upload_success: false,
            photo_upload_error: true
          });
        });
    }
  }
  
handleOpenDeleteConfirm = () => {
  this.setState({ openDeleteConfirm: true });
};

handleCloseDeleteConfirm = () => {
  this.setState({ openDeleteConfirm: false });
};
  
handleDeleteAccount = (userId) => {
  axios.delete(`/deleteUser/${userId}`)
      .then(response => {
          console.log("Account deleted successfully",response);
          this.props.changeUser(undefined); // Assume changeUser logs out the user
          // this.props.history.push('/login'); // Redirect to login page or home
      })
      .catch(error => {
          console.error("Error deleting account:", error);
          // alert("Failed to delete account."); // Provide user feedback
      });
  this.handleCloseDeleteConfirm(); // Close the confirmation dialog
};
  
  handleAppInfoChange() {
    const app_info = this.state.app_info;
    if (app_info === null) {
      axios.get('/test/info')
        .then((response) => {
          this.setState({
            app_info: response.data,
          });
        })
        .catch((error) => {
          console.error('Error fetching app info:', error);
        });
    }
  }

  handleClose = () => {
    this.setState({
        photo_upload_show: false,
        photo_upload_error: false,
        photo_upload_success: false
    });
  };

  toggleSharingDialog()
  {
    this.fetchAllUsers();
    this.setState(prevState => ({ sharingDialogOpen: !prevState.sharingDialogOpen }));
  }

  handleSharingListChange(event) {
    this.setState({ sharingList: event.target.value });
  }
  
  renderSharingDialog()
  {
  
    return (
      <Dialog open={this.state.sharingDialogOpen} onClose={this.toggleSharingDialog}>
        <DialogTitle>Choose who can see this photo</DialogTitle>
        <DialogContent>
          <Select
            multiple
            value={this.state.sharingList}
            onChange={this.handleSharingListChange}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={this.state.allUsers.find(u => u._id === value)?.first_name} />
                ))}
              </Box>
            )}
          >
            {this.state.allUsers.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.first_name} {user.last_name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.toggleSharingDialog}>Cancel</Button>
          <Button onClick={(e) =>
          {
            this.toggleSharingDialog();
            this.handleNewPhoto(e);
          }}>Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  render() {
    return this.state.app_info ? (
      <AppBar className="topbar-appBar" position="fixed">
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 0 }}
            color="inherit"
          >
            {this.props.user ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                  "& svg": {
                    m: 1.5,
                  },
                  "& hr": {
                    mx: 0.5,
                  },
                }}
              >
                <span>{"Hi " + this.props.user.first_name}</span>
                <Divider orientation="vertical" flexItem />
                <Button variant="contained" onClick={this.handleLogout}>
                  Logout
                </Button>
                {this.renderSharingDialog()}
                <Divider orientation="vertical" flexItem />
                <Button component="label" variant="contained">
                  Add Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={(domFileRef) => {
                      this.uploadInput = domFileRef;
                    }}
                    onChange={this.toggleSharingDialog}
                  />
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  variant="contained"
                  color="error"
                  onClick={this.handleOpenDeleteConfirm}
                >
                  Delete Account
                </Button>
                {/* Account Deletion Confirmation Dialog */}
                <Dialog
                  open={this.state.openDeleteConfirm}
                  onClose={this.handleCloseDeleteConfirm}
                >
                  <DialogTitle>{"Confirm Account Deletion"}</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      This action cannot be undone. Are you sure you want to
                      delete your account?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleCloseDeleteConfirm}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => this.handleDeleteAccount(this.props.user._id)}
                      color="secondary"
                    >
                      Delete
                    </Button>
                  </DialogActions>
                </Dialog>
                <Button onClick={this.handleOpenDeleteConfirm}>
                  Delete Account
                </Button>
                <Snackbar
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  open={this.state.photo_upload_show}
                  autoHideDuration={6000}
                  onClose={this.handleClose}
                >
                  {this.state.photo_upload_success ? (
                    <Alert
                      onClose={this.handleClose}
                      severity="success"
                      sx={{ width: "100%" }}
                    >
                      Photo Uploaded
                    </Alert>
                  ) : this.state.photo_upload_error ? (
                    <Alert
                      onClose={this.handleClose}
                      severity="error"
                      sx={{ width: "100%" }}
                    >
                      Error Uploading Photo
                    </Alert>
                  ) : (
                    <div />
                  )}
                </Snackbar>
              </Box>
            ) : (
              "Please Login"
            )}
          </Typography>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1 }}
            color="inherit"
            align="center"
          >
            {this.props.main_content}
          </Typography>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 0 }}
            color="inherit"
          >
            Version: {this.state.app_info.version}
          </Typography>
        </Toolbar>
      </AppBar>
    ) : (
      <div />
    );
  }
  }

export default TopBar;
