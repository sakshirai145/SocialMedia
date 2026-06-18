import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import UserLayout from "../../layout/userlayout";
import { login, registerUser } from "../../redux/action/authAction";

import styles from "./style.module.css";

function LoginComponent() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);

  const [userLoginMethod, setUserLoginMethod] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (authState.isSuccess && authState.loggedIn) {
      navigate("/dashboard");
    }
  }, [authState.isSuccess, authState.loggedIn, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (userLoginMethod) {
      dispatch(login({ email, password }));
      return;
    }

    dispatch(registerUser({ name, username, email, password }));
  };

  const switchAuthMethod = () => {
    setUserLoginMethod((currentMethod) => !currentMethod);
  };

  return (

    <UserLayout>

      <div className={styles.container}>

        <div className={styles.cardContainer}>

          <div className={styles.cardContainer__left}>

            <p className={styles.cardleft__heading}>
              {userLoginMethod ? "Login" : "Register"}
            </p>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Username"
                    type="text"
                    autoComplete="username"
                    required
                  />

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name"
                    type="text"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                type="email"
                autoComplete="email"
                required
              />

              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                autoComplete={userLoginMethod ? "current-password" : "new-password"}
                required
              />

              {authState.message && (
                <p className={authState.isError ? styles.errorMessage : styles.statusMessage}>
                  {authState.message}
                </p>
              )}

              <button
                type="submit"
                className={styles.button}
                disabled={authState.isLoading}
              >
                {authState.isLoading
                  ? "Please wait..."
                  : userLoginMethod
                    ? "Sign In"
                    : "Create Account"}
              </button>

              <button
                type="button"
                className={styles.linkButton}
                onClick={switchAuthMethod}
              >
                {userLoginMethod
                  ? "Create a new account"
                  : "Already have an account? Sign in"}
              </button>
            </form>

          </div>

          <div className={styles.cardContainer__right}>
            <div className={styles.rightContent}>
              <h2 className={styles.rightHeading}>Be a Part</h2>
              <p className={styles.rightText}>
                Connect with professionals, share your journey, and grow your network.
              </p>
              <button
                type="button"
                className={styles.rightButton}
                onClick={() => setUserLoginMethod(false)}
              >
                Join Pro Connect
              </button>
            </div>
          </div>

        </div>

      </div>

    </UserLayout>
  );
}

export default LoginComponent;
