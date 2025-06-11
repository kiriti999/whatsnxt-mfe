import React from 'react';
import { Modal, Button, Text } from '@mantine/core';

const CommonModal = ({
  title = '',
  description = '',
  showModal,
  buttonOneText = '',
  buttonOneVariant = 'filled',
  buttonOneColor = undefined,
  buttonOneHandler,
  buttonTwoText = '',
  buttonTwoVariant = 'filled',
  buttonTwoHandler,
  buttonTwoColor = undefined,
  closeHandler,
}) => {
  return (
    <Modal
      opened={showModal}
      onClose={closeHandler}
      title={title}
      centered
    >
      <Text>{description}</Text>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        {buttonOneText && (
          <Button
            color={buttonOneColor}
            variant={buttonOneVariant}
            onClick={buttonOneHandler}
            style={{ marginRight: 10 }}
          >
            {buttonOneText}
          </Button>
        )}

        {buttonTwoText && (
          <Button
            color={buttonTwoColor}
            variant={buttonTwoVariant}
            onClick={buttonTwoHandler}
          >
            {buttonTwoText}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default CommonModal;
