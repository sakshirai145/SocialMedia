import { useNavigate } from "react-router-dom";
import NavBarComponent from "../../components/navbar";
import styles from "./index.module.css";

export default function DashboardLayout({ children, wide }) {
    const navigate = useNavigate();

    return(
        <div className={styles.dashboard}>
            <NavBarComponent />
            <div className={`${styles.homecontainer} ${wide ? styles.homecontainerWide : ""}`}>
                <div className={`${styles.homecontainer_leftBar} ${wide ? styles.sidebarFixed : ""}`}>
                    <div
                        onClick={() => navigate('/dashboard')}
                        className={styles.sideBarOption}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                             <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <p>Scroll</p>
                    </div>
                    <div
                        onClick={() => navigate("/discover")}
                        className={styles.sideBarOption}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                       <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                         </svg>
                        <p>Discover</p>
                    </div>
                    <div
                        onClick={() => navigate("/profile")}
                        className={styles.sideBarOption}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <p>Profile</p>
                    </div>
                    <div
                        onClick={() => navigate("/my_connections")}
                        className={styles.sideBarOption}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <p>My Connections</p>
                    </div>
                </div>
                <div className={`${styles.homecontainer_feedContainer} ${wide ? styles.wideFeed : ""}`}>
                 {children}
                </div>
                {!wide && (
                    <div className={styles.homecontainer_extracontainer}>
                         <h3>Top Profile</h3>
                    </div>
                )}
            </div>
        </div>
    )
}