'use client';

import React, { useState } from "react";
import { Box, Flex, Text, Title } from "@mantine/core";
import Pagination from "../pagination/pagination";
import TrainerCard from "./TrainerCard";
import styles from './TrainerSearchPage.module.css';

const SearchData = ({ data, total, page, query }) => {
    const [currentPage, setCurrentPage] = useState(page);

    if (data.length <= 0) {
        return <></>
    }

    return (
        <Box mb={'xl'}>
            <div className={styles.top}>
                <Flex justify={'center'} align={'baseline'}>
                    <Text mt={'md'} c='#222222' style={{ textAlign: 'center' }}>
                        ({total}) results found for
                    </Text>
                    <Title order={6} ml={'0.3rem'}>"{query}"</Title>
                </Flex>
            </div>
            <div className={styles.cards}>
                {data.map((trainer) => (
                    <React.Fragment key={trainer?._id}>
                        <TrainerCard trainer={trainer} />
                    </React.Fragment>
                ))}
            </div>
            <Pagination
                nPages={Math.ceil(total / 10)}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </Box>
    )
}

export default SearchData;
