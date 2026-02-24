import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer

# In-memory queue for waiting users
waiting_queue = []


class AnonymousChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.matched = False
        self.room_group_name = None
        self.user_id = None

        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'find_match':
            self.user_id = data.get('user_id', str(uuid.uuid4())[:8])
            await self.find_match()

        elif action == 'send_message':
            message = data.get('message', '')
            if not message.strip() or not self.room_group_name:
                return

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user_id': self.user_id
                }
            )

    async def find_match(self):
        global waiting_queue

        # Remove stale entries of ourselves
        waiting_queue = [w for w in waiting_queue if w['consumer'] != self]

        if waiting_queue:
            # Match with the first person waiting
            partner = waiting_queue.pop(0)
            room_id = str(uuid.uuid4())[:8]
            self.room_group_name = f'chat_{room_id}'
            self.matched = True

            # Also set partner's room
            partner['consumer'].room_group_name = self.room_group_name
            partner['consumer'].matched = True

            # Both join the same group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.channel_layer.group_add(self.room_group_name, partner['consumer'].channel_name)

            # Notify both users they are matched
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'system_message',
                    'message': f'You\'ve been matched! Room: {room_id}',
                    'room_id': room_id
                }
            )
        else:
            # No one waiting — add to queue
            waiting_queue.append({
                'consumer': self,
                'user_id': self.user_id
            })

            # Tell user they are waiting
            await self.send(text_data=json.dumps({
                'type': 'waiting',
                'message': 'Searching for a partner...'
            }))

    async def disconnect(self, close_code):
        global waiting_queue

        # Remove from waiting queue if still there
        waiting_queue = [w for w in waiting_queue if w['consumer'] != self]

        # If matched, notify the room
        if self.matched and self.room_group_name:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'system_message',
                    'message': 'Your partner has disconnected.',
                    'room_id': ''
                }
            )

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    # Handler: regular chat message
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'user_id': event['user_id']
        }))

    # Handler: system message
    async def system_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'message': event['message'],
            'room_id': event.get('room_id', '')
        }))
