import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ChatSystemMessage } from './ChatSystemMessage';
import Mock from '../../../stories/assets/mocks/chatmessage-system.png';
import { ChatMessage } from '../../../interfaces/chat-message.model';

export default {
  title: 'owncast/Chat/Messages/System',
  component: ChatSystemMessage,
  parameters: {
    design: {
      type: 'image',
      url: Mock,
    },
    docs: {
      description: {
        component: `This is the message design used when the server sends a message to chat.`,
      },
    },
  },
} as ComponentMeta<typeof ChatSystemMessage>;

const Template: ComponentStory<typeof ChatSystemMessage> = args => <ChatSystemMessage {...args} />;

const message: ChatMessage = JSON.parse(`{
  "type": "SYSTEM",
  "id": "wY-MEXwnR",
  "timestamp": "2022-04-28T20:30:27.001762726Z",
  "user": {
    "id": "h_5GQ6E7R",
    "displayName": "Cool Server Name",
    "createdAt": "2022-03-24T03:52:37.966584694Z",
    "scopes": []
  },
  "body": "Test system message from the chat server."}`);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Basic = Template.bind({});
Basic.args = {
  message,
};

export const HighlightExample = Template.bind({});
HighlightExample.args = {
  message,
  highlightString: 'chat',
};
