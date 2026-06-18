import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import UserLayout from "../layout/userlayout";

import style from "./styles/home.module.css";

function Homes() {
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [loggedIn, navigate]);

  return (

    <UserLayout>

      <div className={style.container}>

        <div className={style.maincontainer}>

          <div className={style.maincontainer__left}>

            <p>
              Connect with Friends without Exaggeration
            </p>

            <p>
              A True Social Media Platform, with stories no bluffs!
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className={style.buttonJoin}
            >
              Join Now
            </button>

          </div>

          <div className={style.maincontainer__right}>

            <img
              src="/images/socialMedia.jpeg"
              alt="social media"
              className={style.mainImage}
            />

          </div>

        </div>

      </div>

    </UserLayout>
  );
}

export default Homes;
