import { useParams, Link } from 'react-router-dom';
import { Helmet } from "react-helmet";

import Caller from '../../components/Caller';

import { buildPageTitle } from '../../utils/misc';

import './PlainPage.scss';

export default function PlainPage ({
    Content,
    title: sectionTitle
}) {
    const { lang } = useParams();

    return (
        <div className="PlainPage secondary-page">
            <Helmet>
                <title>{buildPageTitle(sectionTitle, lang)}</title>
            </Helmet>

            <div className='centered-contents'>
                <h1>{sectionTitle}</h1>
                <Content components={{ Caller, Link }} />
            </div>
        </div>
    )
}