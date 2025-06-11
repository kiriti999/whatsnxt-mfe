import React from 'react';
import SidebarPopularTags from '../sidebar-category/sidebar-category';
import SidebarPost from '../sidebar-post';

function Sidebar() {
  return (
    <div>
      {/* <SidebarSearch></SidebarSearch> */}

      <SidebarPost></SidebarPost>

      <SidebarPopularTags></SidebarPopularTags>
    </div>
  );
}

export default Sidebar;
