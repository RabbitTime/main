import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';

const TimeTable = () => {
  const { id } = useParams();
  // Set up the state
  const [event, setEvent] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  //const [users, setUsers] = useState([]);

  // useEffect hook runs the fetchEvent function every time "id" changes.
  useEffect(() => {
    // async function fetchEvent fetches event data and updates states.
    const fetchEvent = async () => {
      // Fetch event data from the backend.
      const response = await fetch(`/events/${id}`);
      const eventData = await response.json();

      // Map users from eventData to selectedSlots object.
      const selectedSlots = eventData.users.reduce((slots, user) => {
        slots[user.name] = user.availability;
        return slots;
      }, {});

      // Update selectedSlots and event states with new data.
      setSelectedSlots(selectedSlots);
      setEvent(eventData);
    };

    // Perform fetch operation.
    fetchEvent();
  }, [id]); // Dependency array - effect runs when "id" changes.

  // Generate time slots based on user input
  const generateTimeSlots = (start, end) => {
    const timeSlots = [];
    const currentTime = moment(start, 'h:mm A');
    const endTime = moment(end, 'h:mm A');

    // Loop to generate time slots
    while (currentTime <= endTime) {
      timeSlots.push(currentTime.format('h:mm A'));
      currentTime.add(30, 'minutes');
    }

    return timeSlots;
  };

  // Handle time slot interaction from the user
  const handleTimeSlots = (name, date, timeSlot) => {
    // Add selected time slot to the list
    setSelectedSlots((prevSlots) => {
      // Create a copy of the previous slots
      let newSlots = Object.assign({}, prevSlots);

      // If the user has already selected some slots, add the new slot to their array
      if (newSlots[name]) {
        newSlots[name].push({ date, timeSlot });
      }
      // Otherwise, create a new array for this user
      else {
        newSlots[name] = [{ date, timeSlot }];
      }

      return newSlots;
    });

    // Make a request to update user availability
    fetch(`/events/${id}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, date, timeSlot }),
    });
  };

  const renderTable = () => {
    if (!event) return null;

    const { times, dates } = event;
    const { start, end } = times;
    const startTime = moment(start, 'h:mm A');
    const endTime = moment(end, 'h:mm A');

    // Render the table with date headings and time slots
    // Create a parent div to hold all dates and their corresponding time slots.
    //for each date in the  dates array, create div.  use the date as the unique 'key' for each div
    //Create a heading for the date
    //Create div to hold the time slots for this date
    //each time slot made by 'generateTimeSlots' function, create a button.  use time slot as unique 'key' for each button
    // button is clicked the 'handleTimeSlots' with  event's name, date, time slot
    // The button's color is determined by  'getButtonColor' function.
    // The button's text is the time slot.

    return (
      <div>
        {dates.map((date) => (
          <div key={date}>
            <h2>{date}</h2>
            <div>
              {generateTimeSlots(startTime, endTime).map((timeSlot) => (
                <button
                  key={timeSlot}
                  onClick={() => handleTimeSlots(event.name, date, timeSlot)}
                  style={{
                    backgroundColor: getButtonColor(date, timeSlot),
                  }}>
                  {timeSlot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  const getButtonColor = (date, timeSlot) => {
    // Count how many users have selected this time slot
    let count = 0;
    // Iterate over each user in selectedSlots
    for (let user in selectedSlots) {
      // Check if any slot in selectedSlots[user] has the same date and timeSlot
      if (
        selectedSlots[user].some(
          (slot) => slot.date === date && slot.timeSlot === timeSlot
        )
      ) {
        count++; // Increment count by 1 if condition is met
      }
    }

    // Change color based on the count
    if (count > 1) {
      return 'green';
    } else if (count === 1) {
      return 'yellow';
    } else {
      return 'red';
    }
  };

  const renderUsers = () => {
    // Render the list of users
    const userNames = Object.keys(selectedSlots);

    return (
      <div>
        <h2>Users</h2>
        {userNames.map((user) => (
          <p key={user}>{user}</p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {renderTable()}
      {renderUsers()}
    </div>
  );
};

export default TimeTable;
