import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { reset } from "../../redux/reducer/authReducer";
import styles from "./styles.module.css";

export default function NavBarComponent() {

  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth)
  const navigate = useNavigate();
  const loggedIn = useSelector((state) => state.auth.loggedIn);

  return (
    <div className={styles.container}>

      <nav className={styles.navBar}>

        <h1
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Pro Connect
        </h1>

        <div className={styles.navBarOptionContainer}>

            {authState.profileFetched && (
              <div className={styles.navLinkGroup}>
              <p className={styles.userGreeting}>Hey <span>{authState.user?.userId?.name}</span></p>
              <p className={styles.navLink} onClick={() => navigate("/profile")}>Profile</p>
              <p className={styles.logoutLink} onClick={()=>{
                dispatch(reset())
                navigate("/login")
              }}>Logout</p>
              </div>
            )}

          { !authState.profileFetched && <button
            onClick={() => navigate(loggedIn ? "/dashboard" : "/login")}
            className={styles.buttonJoin}
          >
            <p> Be a part</p>
          </button> }

          {loggedIn ? "Dashboard" : "Be a part"}
        </div>

      </nav>

    </div>
  );
}
