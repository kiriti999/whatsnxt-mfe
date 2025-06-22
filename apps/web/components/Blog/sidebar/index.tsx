import React from 'react';
import SidebarArticleTags from '../sidebar-tags/sidebar-article-tags';
import SidebarPost from '../sidebar-post';

function Sidebar() {
  return (
    <div>
      {/* <SidebarSearch></SidebarSearch> */}

      <SidebarPost></SidebarPost>

      <SidebarArticleTags></SidebarArticleTags>
    </div>
  );
}

export default Sidebar;
