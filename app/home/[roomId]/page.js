'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Background from '@/components/Background';

export default function Home() {
  const images = Array.from({ length: 49 }, (_, i) => `${i + 1}.png`);
  const [chosenAvatar, setChosenAvatar] = useState('37.png');
  const [teamName, setTeamName] = useState('');
  const [submit, setSubmit] = useState(false);
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [resolved, setResolved] = useState(false);

  // 1️⃣ Resolve roomId (URL → sessionStorage)
  useEffect(() => {
    const idFromUrl = params?.roomId;
    const idFromSession = sessionStorage.getItem('roomId');
    const finalRoomId = idFromUrl || idFromSession;
    if (finalRoomId) {
      setRoomId(finalRoomId);
      sessionStorage.setItem('roomId', finalRoomId);
    }
    setResolved(true);
  }, [params]);

  useEffect(() => {
    if (!roomId) return;
    const validateRoom = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/validateRoom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (data.valid) {
          router.replace(`/home/${roomId}`);
          setLoading(false)
        } else {
          alert('Wrong room id! Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
        setLoading(false);
      }
    };
    validateRoom();
  }, [roomId, router]);
  // this can be used to fetch the data received through params in the url, for that this component will recieve something which can be destructured as "{params}" to get "params" i.e. export default function Home({params}){}

  useEffect(() => {
    if (!resolved) return;
    if (!roomId) {
      alert('Unauthorised access');
      router.replace('/');
    }
  }, [resolved, roomId, router]);

  function handleNameChange(e) {
    // console.log(e.target.value);
    setTeamName(e.target.value);
  }

  function handleAvatarClick(image) {
    setChosenAvatar(image);
  }

  useEffect(() => {
    const handleSubmit = async () => {
      if (submit && !loading) {
        setLoading(true);

        // Step 1: Check duplicate name
        const res = await fetch(`/api/fetchTeamNames?room_id=${roomId}`);
        const data = await res.json();

        if (data.success) {
          const namesList = data.data;
          const sameName = namesList.some(
            (item) => item.name.toLowerCase() === teamName.toLowerCase(),
          );

          if (sameName) {
            alert(
              'This name is already taken!, please think of something else',
            );
            setLoading(false);
            setSubmit(false); // reset submit so effect can rerun
            return;
          }

          // Step 2: Save team data
          const response = await fetch('/api/saveTeamData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: teamName,
              avatar: chosenAvatar,
              room_id: roomId,
            }),
          });

          const result = await response.json();

          if (result.message?.startsWith('duplicate key')) {
            alert('You already have a team');
            setLoading(false);
            setSubmit(false);
            return;
          }

          sessionStorage.setItem('teamId', result?.data[0].id);
          result.success && router.replace(`/team_formation`);
        } else {
          alert('Failed to fetch team names. Try again.');
          setLoading(false);
        }
      }
    };

    handleSubmit();
  }, [submit]); // Just depend on submit

  return (
    <div className="wrapper">
      <Background url={'noTextBackground.jpg'} />
      {/* <Background url={"background.jpg"} /> */}
      <section className={styles.container}>
        <h1>Choose Your Avatar</h1>

        <div className={styles.chosenAvatar}>
          <img
            src={`/images/avatars/${chosenAvatar}`}
            alt="chosen avatar"
            className={styles.avatar}
            key={chosenAvatar} // Forces the component to re-mount an fires the animation everytime the "chosenAvatar" is changed
          />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            name="name"
            placeholder="Enter team name"
            onChange={handleNameChange}
            // className={styles.inputField}
          />
        </form>

        <section className={styles.avatarContainer}>
          {images.map((image, index) => (
            <img
              key={index}
              src={`/images/avatars/${image}`}
              alt={`avatar ${index + 1}`}
              className={styles.availableAvatars}
              onClick={() => {
                handleAvatarClick(image);
              }}
            />
          ))}
        </section>
        {teamName.length != 0 && (
          <button className={styles.submit} onClick={() => setSubmit(true)}>
            {loading ? 'Saving...' : "Let's begin"}
          </button>
        )}
      </section>
    </div>
  );
}
