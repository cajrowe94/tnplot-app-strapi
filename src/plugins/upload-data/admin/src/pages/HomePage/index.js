/*
 *
 * HomePage
 *
 */

import React from 'react';
import { Layout, ContentLayout, BaseHeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Select, Option } from '@strapi/design-system/Select';
import File from '@strapi/icons/File';

const HomePage = () => {
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
                >
                    <Option>Test</Option>
                </Select>
            </ContentLayout>
        </Layout>
    );
};

export default HomePage;
