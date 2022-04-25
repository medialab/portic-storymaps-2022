import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";

import { buildPageTitle } from '../../utils/misc';

import './PlainPage.scss';

export default function PlainPage ({
    Content,
    title
}) {
    const { lang } = useParams();

    return (
        <div className="PlainPage secondary-page">
            <Helmet>
                <title>{buildPageTitle(title, lang)}</title>
            </Helmet>

            <div className='centered-contents'>
                <Content />
            </div>
        </div>
    )
}