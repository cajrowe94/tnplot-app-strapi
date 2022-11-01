/*
 *
 * HomePage
 *
 */

import React, { useState, useEffect } from 'react';
import { Layout, ContentLayout, BaseHeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Typography } from '@strapi/design-system/Typography';
import { Divider } from '@strapi/design-system/Divider';
import Upload from '@strapi/icons/Upload';
import { Select, Option } from '@strapi/design-system/Select';
import File from '@strapi/icons/File';
import Message from '../../components/Message';

const HomePage = () => {
    const [loadingMediaFiles, setLoadingMediaFiles] = useState(false);
    const [updatingData, setUpdatingData] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [selectValue, setSelectValue] = useState();
    const [plotData, setPlotData] = useState([]);

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

    // useEffect(() => {
    //     plotData.map((data, i) => {
    //         console.log(typeof data, data);
    //     });
    // }, [plotData]);

    const sendFileToUpdate = () => {
        setUpdatingData(true);

        fetch('http://localhost:1337/upload-data/update-plot-data', {
            'method': 'POST',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.STRAPI_ADMIN_JWT_DEV_TOKEN,
            'body': JSON.stringify({'fileId': selectValue})
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                setPlotData(data);
            }

            setUpdatingData(false);
        })
        .catch(error => {
            console.log('Error updating data: ', error);
            setUpdatingData(false);
        })
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

            {
                selectValue &&
                <Button
                    onClick={sendFileToUpdate}
                    style={{ marginTop: '20px' }}
                    loading={updatingData}
                >
                    Update plot data
                </Button>
            }

            {
                plotData.length > 0 &&
                plotData.map((data, i) => {
                     return <div style={{ marginTop: '40px' }} key={i}>
                        <Typography variant="pi">{`Row ${i}`}</Typography>
                        <Divider style={{ margin: '10px 0px 20px 0px' }} />

                        <div><Typography variant="epsilon">{'Plot updates'}</Typography></div>
                        {
                            data.error ?
                                <Message error={data.error} /> :
                                <Message messages={data.updates.plot.messages} />
                        }

                        <div style={{ marginTop: '10px' }}><Typography variant="epsilon">{'County updates'}</Typography></div>
                        {
                            data.error ?
                                <Message error={data.error} /> :
                                <Message messages={data.updates.county.messages} />
                        }
                    </div>
                })
            }

            </ContentLayout>
        </Layout>
    );
};

export default HomePage;
