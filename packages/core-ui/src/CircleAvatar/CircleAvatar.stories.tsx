import type { Meta, StoryObj } from "@storybook/react";
import { CircleAvatar } from "./CircleAvatar";

/**
 * Add a description of your component here 
 *
 * - This **description** _suports_ `Markdown`
 */
const meta: Meta<typeof CircleAvatar> = {
  title: "Core Ui/CircleAvatar",
  component: CircleAvatar
};

export default meta;

type Story = StoryObj<typeof CircleAvatar>;

/**
* This is a default example
*/
export const DefaultCircleAvatar: Story = {
  args: {}
};
