import React, { FC } from 'react';
import { Button, Flex, Modal, Title } from "@mantine/core";

type PROPS = {
    onDeleteComment: () => void,
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

const DeleteConfirmation: FC<PROPS> = ({ onDeleteComment, isOpen, setIsOpen }) => {
    return (
        <Modal opened={isOpen} onClose={() => setIsOpen(false)} title={<Title order={4}>Delete comment?</Title>}>
            <Flex direction='column'>
                Are you sure you want to delete your comment? You can't undo this.
                <Flex justify='flex-end'>
                    <Button variant='subtle' c='blue' onClick={() => setIsOpen(false)} size='sm'>Cancel</Button>
                    <Button variant='subtle' c='red' onClick={onDeleteComment} size='sm'>Delete</Button>
                </Flex>
            </Flex>
        </Modal>
    )
}

export default DeleteConfirmation;
