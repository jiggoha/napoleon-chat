# napoleon-chat
Chat component of Napoleon game that will hopefully expand to the whole thing.
Express and Socket.IO practice.

DONE:

  Socket.io:
  * Broadcast a message to connected users when someone connects or disconnects
  * Add support for nicknames
  * When new users are added, they will see the most recent messages from before they joined
  * Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
  * Show who’s online
  * Add “{user} is typing” functionality
  
  Napoleon:
  * Creation of a deck of cards
  * Shuffling and dealing the deck of cards


TODO:

  Socket.io:
  * Add private messaging
  
  Napoleon:
  * Functions for declaring Napoleon and Secretary, for determining the winning card of a play, for ending the game
  * Get user input for each of the above functions
  * more...
