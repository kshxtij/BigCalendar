use rspotify::{
    model::{AdditionalType, Country, Market},
    prelude::*,
    scopes, AuthCodeSpotify, Config, Credentials, OAuth,
};
use std::sync::Mutex;
use std::{path::PathBuf, sync::Arc};

// Shared Spotify client that can be used across commands
struct SpotifyState {
    client: AuthCodeSpotify,
}

#[derive(serde::Serialize)]
struct RecentlyPlayedSong {
    is_playing: bool,
    title: String,
    artist: String,
    album: String,
    album_image_url: String,
    song_url: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from your mom!", name)
}

#[tauri::command(async)]
async fn get_currently_playing_song(
    state: tauri::State<'_, Arc<Mutex<SpotifyState>>>,
) -> Result<RecentlyPlayedSong, String> {
    let client = {
        let state = state.lock().map_err(|e| e.to_string())?;
        state.client.clone()
    };

    let market = Market::Country(Country::Spain);
    let additional_types = [AdditionalType::Track];

    // Get the currently playing song
    let song = client
        .current_playing(Some(market), Some(&additional_types))
        .await
        .map_err(|e| e.to_string())?;

    if let Some(song) = song {
        let something = song.item.unwrap();
        if let rspotify::model::PlayableItem::Track(track) = something {
            let title = track.name.clone();
            let artist = track.artists[0].name.clone();
            let album = track.album.name.clone();
            let album_image_url = track.album.images[0].url.clone();
            let song_url = track.external_urls["spotify"].clone();
            Ok(RecentlyPlayedSong {
                is_playing: song.is_playing,
                title,
                artist,
                album,
                album_image_url,
                song_url,
            })
        } else {
            Ok(RecentlyPlayedSong {
                is_playing: song.is_playing,
                title: "No song is currently playing".to_string(),
                artist: "".to_string(),
                album: "".to_string(),
                album_image_url: "".to_string(),
                song_url: "".to_string(),
            })
        }
    } else {
        Ok(RecentlyPlayedSong {
            is_playing: false,
            title: "No song is currently playing".to_string(),
            artist: "".to_string(),
            album: "".to_string(),
            album_image_url: "".to_string(),
            song_url: "".to_string(),
        })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize Spotify client
    let creds = Credentials {
        id: "8b9885bf2a144db4b3ef502aaedd727a".to_string(),
        secret: Some("ee9419a4bc5743fa9b6ea62b24427518".to_string()),
    };

    let oauth = OAuth {
        redirect_uri: "http://localhost:8888/callback".to_string(),
        scopes: scopes!("user-read-currently-playing"),
        ..Default::default()
    };

    let config = Config {
        token_cached: true,
        ..Default::default()
    };

    let spotify = AuthCodeSpotify::with_config(creds, oauth, config);

    // Get authorization URL
    let url = spotify.get_authorize_url(false).unwrap();

    // Create shared state
    let spotify_state = SpotifyState { client: spotify };
    let shared_state = Arc::new(Mutex::new(spotify_state));
    let state_clone = shared_state.clone();
    let client_clone = {
        let state = state_clone.lock().unwrap();
        state.client.clone()
    };

    // Initialize authorization in a separate task
    tauri::async_runtime::spawn(async move {
        if let Err(e) = client_clone.prompt_for_token(&url).await {
            eprintln!("Failed to get token: {}", e);
        }
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(shared_state)
        .invoke_handler(tauri::generate_handler![greet, get_currently_playing_song])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
