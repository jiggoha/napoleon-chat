# napoleon-chat
Chat component of Napoleon game that will hopefully expand to the whole thing.
Express and Socket.IO practice.


Rules of the game found here: http://bantha.org/~develin/cardgames.html#ch6. My implementation assumes there are 4 players.


DONE

  Socket.io:
  * Broadcast a message to connected users when someone connects or disconnects
  * Add support for nicknames
  * When new users are added, they will see the most recent messages from before they joined
  * Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
  * Show who’s online
  * Add “{user} is typing” functionality
  * Function for determing the winning card of a trick (~~NOTE: doesn't work when called from index.js yet because of scoping issue. Will fix.~~)
  
  Napoleon:
  * Creation of a deck of cards
  * Shuffling and dealing the deck of cards
  * After 4 players join, the deck is dealt and each player sees their hands


TODO

  Socket.io:
  * Add private messaging
  
  Napoleon:
  * Fix hacky dealing
  * Allow players to play cards. Need some sort of sequencing for who moves.
  * Functions for declaring Napoleon and Secretary, for ending the game
  * Get user input for each of the above functions
  * more...
