import React, { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { connect } from "react-redux";

import { updateAuthToken } from "../actions/auth.js";

function NotAuthedOnlyRoute(props) {
  const history = useHistory();
  const tokenInCookie = document.cookie.split("=")[1];

  useEffect(() => {
    if (tokenInCookie) {
      props.updateAuthToken(tokenInCookie);
    }

    const { auth } = props;
    const { logged_in, error } = auth.login;

		if (logged_in && auth.token && !error && !tokenInCookie) {
      const dateExpires = new Date();

      dateExpires.setTime(dateExpires.getTime() + 604800000);

      document.cookie = (
        `token=${props.auth.token};expires=${dateExpires.toGMTString()};`
      );

      history.push("/")
    }

    if (auth.token && tokenInCookie) {
      history.push("/");
    }
  }, [props.auth]);

  // auto login when logged in another instance
  useEffect(() => {
    const bc = new BroadcastChannel("dim");

    bc.onmessage = (e) => {
      if (document.hasFocus()) return;

      if (e.data === "login") {
        /*
          cannot use history.push, throws an error when
          tab is not active and it tries to redirect.
        */
        window.location.replace("/");
      }
    };

    return () => bc.close();
  }, []);

  /*
    scroll to top on route change
    (cannot enable smooth -> page doesn't go fully up)
  */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [history.location.pathname]);

  const { exact, path, render, children } = props;

  return (!props.auth.token && !tokenInCookie) && (
    <Route exact={exact} path={path} render={render} children={children}/>
  );
}

const mapStateToProps = (state) => ({
    auth: state.auth
});

const mapActionsToProps = ({
    updateAuthToken
});

export default connect(mapStateToProps, mapActionsToProps)(NotAuthedOnlyRoute);