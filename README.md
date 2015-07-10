# Napoleon
Napoleon card game integrated with real-time chat component.
Express, Socket.IO, MongoDB, JQuery.

Rules:
* 4 player card game with turn based tricks
* players start by bidding on number of royals (A, K, Q, J) that can be won by the "attacking" team (need for chat integration)
* player who bids highest becomes Napoleon
* Napoleon may exchange 4 of his/her cards with those in the kitty once in the beginning of the game
* Napoleon declares a secretary card as the most powerful card that wins any trick
* player who holds the secretary card is the secretary, and his/her identity is secret initially
* the secretary card may be played whenever
* Napoleon also declares a suit to be trump
* trump must be played only when a player cannot follow suite
* otherwise, players must always follow suit
* Napoleon and secretary are on a team to win the number of royals that the Napoleon initially bid. The other two players on the "defending" team try to win enough royals to stop the Napoleon and secretary from achieving their bid goal.

More in-depth rules of the game may be found here: http://bantha.org/~develin/cardgames.html#ch6. My implementation assumes there are 4 players.


DONE

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
  * After 4 players join, the deck is dealt and each player sees their hands
  * Hands are sorted after being dealt
  * Remove card when player clicks to play it
  * Only allows players to play a card when it is their turn
  * Function for determing the winning card of a trick
  * The winner of each trick leads the next
  * Get user input declaring Napoleon, trump, secretary card
  * Functions for declaring Napoleon, secretary card, trump
  * End game, keep track of points
  * Declare bid
  * Who wins bug where Ace isn't highest fixed
  * Who wins bug where Secretary card doesn't win fixed
  * Who wins bug: card is removed from hand so can't search for it

  Started testing


TODO

  Socket.io:
  * Add private messaging
  
  Napoleon:
  * Allow Napoleon to trade in with kitty