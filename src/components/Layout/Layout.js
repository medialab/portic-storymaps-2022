import React, { useMemo } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";

import Header from './Header';
import Footer from './Footer';

import routes from '../../summary';

export default function Layout({
    ...props
}) {
    const { lang } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const pageType = useMemo(() => {
        let { pathname } = location;
        const [_, lang, page] = pathname.split('/');

        if (page === undefined) {
            return 'home';
        }

        if (page === 'atlas') {
            return 'atlas';
        }

        for (const route of routes) {
            if (route.routes[lang] === page) {
                return route.routeGroup;
            }
        }

        return 'other-page'; // default case
    }, [location]);

    function onLangChange(newLangFlag) {
        let { pathname } = location;
        const [_, formerLang, page] = pathname.split('/');

        const partPageMetas = routes.find(route => route.routes[formerLang] === page);
        
        if (partPageMetas !== undefined) {
            navigate(`/${newLangFlag}/${partPageMetas.routes[newLangFlag]}`);
            return;
        }

        switch (page) {
            case 'atlas':
                navigate(`/${newLangFlag}/${page}`)
                return;
            default:
            case undefined:
                navigate(`/${newLangFlag}`)
                return;
        }
    }

    return (
        <>
            <Header lang={lang} onLangChange={onLangChange} pageType={pageType} {...props} />

            <main className="wrapper">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}