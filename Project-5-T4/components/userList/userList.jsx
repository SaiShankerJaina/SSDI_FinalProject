import React from 'react';
import { Divider, List, ListItem, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userList.css';
import axios from 'axios';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
    };
  }

  componentDidMount() {
    const url = '/user/list';

    axios.get(url)
      .then((response) => {
        this.setState({ userList: response.data });
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
      });
  }

render() {
const { userList } = this.state;

return (
 <div style={{ display: 'flex' }}>
   <div style={{ width: '400%' }}>
     <List component="nav">
       {userList.map((user) => (
         <div key={user._id}>
           <ListItem>
             <Button
               component={Link}
               to={`/users/${user._id}`}
               className="ButtonStyle" 
             >
               {`${user.first_name} ${user.last_name}`}
             </Button>
           </ListItem>
           <Divider />
         </div>
       ))}
     </List>
   </div>
    <div>
     {this.props.children}
    </div>
    
 </div>
);
}
}

export default UserList;
