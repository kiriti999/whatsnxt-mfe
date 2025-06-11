import React, { FC } from 'react';
import { Button, Flex, Modal, Title } from "@mantine/core";

type PROPS = {
    onCommentDiscard: () => void,
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

const Discard: FC<PROPS> = ({ onCommentDiscard, isOpen, setIsOpen }) => {
    return (
        <Modal opened={isOpen} onClose={() => setIsOpen(false)} title={<Title order={4}>Discard comment?</Title>}>
            <Flex direction='column'>
                You have a comment in progress, are you sure you want to discard it?
                <Flex justify='flex-end'>
                    <Button variant='subtle' c='blue' onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button variant='subtle' c='red' onClick={onCommentDiscard}>Discard</Button>
                </Flex>
            </Flex>
        </Modal>
    )
}

export default Discard;
