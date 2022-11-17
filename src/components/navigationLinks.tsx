import { Link, useLocation } from "react-router-dom";
import React, { ReactElement } from "react";

export function NavigationLinks(): ReactElement {
    const { pathname } = useLocation();

    const list = [
        {
            id: "deploy-questionnaire-link",
            title: "Deploy a questionnaire",
            link: "/upload"
        }, {
            id: "audit-logs-link",
            title: "View deployment history",
            link: "/audit"
        }, {
            id: "blaise-status-link",
            title: "Check Blaise status",
            link: "/status"
        },
    ];

    return (
        <div className="ons-header__bottom">
            <div className="ons-container ons-container--gutterless@xxs@m">
                <nav className="ons-header-nav ons-js-header-nav" id="main-nav" aria-label="Main menu"
                    data-analytics="header-navigation">
                    <ul className="ons-header-nav__list">
                        <li className={`ons-header-nav__item  ${(pathname === "/" ? "ons-header-nav__item--active" : "")}`}>
                            <Link to="/" id="home-link" className="ons-header-nav__link">
                                Home
                            </Link>
                        </li>
                        {list.map(({ id, title, link }) => {
                            return (
                                <li key={id}
                                    className={`ons-header-nav__item  ${(pathname.includes(link) ? "ons-header-nav__item--active" : "")}`}>
                                    <Link to={link} id={id} className="ons-header-nav__link">
                                        {title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
