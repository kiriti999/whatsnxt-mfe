import React, { useEffect, useState } from 'react';
import LinkItem from './LinkItem';
import { Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
const LectureLinksComponent = ({ allLinks, lectureId, onSaveLectureLink, onLectureLinkUpdate, isEditingLectureLink, onAddLectureClick, onLectureLinkDelete, onEditClick }) => {

  const handleAddLectureLink = async () => {
    onAddLectureClick();
  }
  return (
    <>
      {allLinks?.map((link, index) => (
        <LinkItem key={index} link={link} isNewLink={link?.isNewLink} onSaveLectureLink={onSaveLectureLink} onLectureLinkUpdate={onLectureLinkUpdate} onLectureLinkDelete={onLectureLinkDelete} onEditClick={onEditClick} />
      ))}
      <Button
        variant="outline"
        leftSection={<IconPlus size={16} />}
        onClick={handleAddLectureLink}
        fullWidth
        disabled={isEditingLectureLink}
      >
        Add Link
      </Button>
    </>
  );
};

export default LectureLinksComponent;
