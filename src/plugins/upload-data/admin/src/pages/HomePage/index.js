/*
 *
 * HomePage
 *
 */

import React, { useState, useEffect } from 'react';
import { Layout, ContentLayout, BaseHeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import Upload from '@strapi/icons/Upload';
import { Select, Option } from '@strapi/design-system/Select';
import File from '@strapi/icons/File';

const HomePage = () => {
    const [loadingMediaFiles, setLoadingMediaFiles] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [selectValue, setSelectValue] = useState();

    /**
     * Load media files for select
     */
    
    useEffect(() => {
        if (!mediaFiles.length) {
            loadMediaFiles();
        }
    }, []);

    const loadMediaFiles = () => {
        setLoadingMediaFiles(true);

        fetch('http://localhost:1337/api/upload/files', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.STRAPI_ADMIN_JWT_DEV_TOKEN
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                setMediaFiles(data);
            }

            setLoadingMediaFiles(false);
        })
        .catch(error => {
            console.log('Error retrieving data: ', error);
            setLoadingMediaFiles(false);
        })
    }

    const sendFileToUpdate = () => {
        console.log(selectValue);
    }

    return (
        <Layout>
            <BaseHeaderLayout
                title="Update Plot Data"
                as="h2"
            />

            <ContentLayout>
                <Select
                    label="Choose file"
                    placeholder="Nothing selected"
                    value={selectValue}
                    onChange={setSelectValue}

                >
                    {
                        mediaFiles.length > 0 &&
                        mediaFiles.map((item, i) => {
                            return <Option key={i} value={item.id}>{item.name}</Option>
                        })
                    }
                </Select>

            { selectValue && <Button onClick={sendFileToUpdate} style={{ marginTop: '20px' }}>Update plot data</Button> }

            </ContentLayout>
        </Layout>
    );
};

export default HomePage;
