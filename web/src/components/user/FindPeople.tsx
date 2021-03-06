import React from 'react';
import {
  Snackbar,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  makeStyles,
} from '@material-ui/core';
import ViewIcon from '@material-ui/icons/Visibility';
import Link from 'next/link';
import { UserApiService } from 'src/services/userapi.service';
import { AuthHelper } from 'src/helpers/auth.helper';

type ComponentState = {
  users: any;
  open: boolean;
  followMessage: string;
};

const useStyles = makeStyles((theme) => ({
  root: theme.mixins.gutters({
    padding: theme.spacing(),
    margin: 0,
  }),
  title: {
    margin: `${theme.spacing(3)}px ${theme.spacing()}px ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
    fontSize: '1em',
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  follow: {
    right: theme.spacing(2),
  },
  snack: {
    color: theme.palette.protectedTitle,
  },
  viewButton: {
    verticalAlign: 'middle',
  },
}));

const FindPeople = () => {
  const classes = useStyles();
  const [state, setState] = React.useState<ComponentState | null>({
    users: [],
    open: false,
    followMessage: '',
  });

  React.useEffect(() => {
    const jwt = AuthHelper.isAuthenticated();

    UserApiService.findPeople({ userId: jwt.user._id }, { t: jwt.token }).then(
      (data) => {
        if (data && data.error) {
          console.log(data.error);
        } else {
          setState({ ...state, users: data });
        }
      }
    );
  }, []);

  const clickFollow = (user, index) => {
    const jwt = AuthHelper.isAuthenticated();

    UserApiService.follow(
      { userId: jwt.user._id },
      { t: jwt.token },
      user._id
    ).then((data) => {
      if (data && data.error) {
        console.log(data.error);
      } else {
        let toFollow = state.users;
        toFollow.splice(index, 1);

        setState({
          users: toFollow,
          open: true,
          followMessage: `Following ${user.name}!`,
        });
      }
    });
  };

  const handleRequestClose = () => {
    setState({ ...state, open: false });
  };

  return (
    <div>
      <Paper className={classes.root} elevation={4}>
        <Typography variant='h6' className={classes.title}>
          Who to follow
        </Typography>
        <List>
          {state.users.map((item, i) => {
            return (
              <span key={i}>
                <ListItem>
                  <ListItemAvatar className={classes.avatar}>
                    <Avatar src={UserApiService.getPhotoUrl(item._id)} />
                  </ListItemAvatar>
                  <ListItemText primary={item.name} />
                  <ListItemSecondaryAction className={classes.follow}>
                    <Link
                      as={`/profile/${item._id}`}
                      href={'/profile?userId=' + item._id}
                    >
                      <IconButton
                        color='secondary'
                        className={classes.viewButton}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Link>
                    <Button
                      aria-label='Follow'
                      variant='contained'
                      color='primary'
                      onClick={clickFollow.bind(this, item, i)}
                    >
                      Follow
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </span>
            );
          })}
        </List>
      </Paper>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={state.open}
        onClose={handleRequestClose}
        autoHideDuration={6000}
        message={<span className={classes.snack}>{state.followMessage}</span>}
      />
    </div>
  );
};

export default FindPeople;
