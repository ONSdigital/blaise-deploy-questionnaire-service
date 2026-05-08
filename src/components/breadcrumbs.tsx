import React, { type ReactElement } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  link: string;
  title: string;
}

interface Props {
  breadcrumbList: BreadcrumbItem[];
}

function Breadcrumbs({ breadcrumbList }: Props): ReactElement {
  return (
    <nav
      className="ons-breadcrumbs"
      aria-label="Breadcrumbs"
    >
      <ol className="ons-breadcrumbs__items ons-u-fs-s">
        {breadcrumbList.map(({ link, title }: BreadcrumbItem) => {
          const breadcrumbId = `breadcrumb-${link}-${title}`.replace(/[^a-zA-Z0-9-_]/g, "-");

          return (
            <li
              className="ons-breadcrumbs__item"
              id={breadcrumbId}
              data-testid={breadcrumbId}
              key={`${link}-${title}`}
            >
              <Link
                className="ons-breadcrumbs__link"
                to={link}
              >
                {title}
              </Link>
              <svg
                className="ons-icon"
                viewBox="0 0 8 13"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
                fill="currentColor"
                role="img"
                aria-hidden="true"
              >
                <path
                  d="M5.74,14.28l-.57-.56a.5.5,0,0,1,0-.71h0l5-5-5-5a.5.5,0,0,1,0-.71h0l.57-.56a.5.5,0,0,1,.71,0h0l5.93,5.93a.5.5,0,0,1,0,.7L6.45,14.28a.5.5,0,0,1-.71,0Z"
                  transform="translate(-5.02 -1.59)"
                />
              </svg>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
