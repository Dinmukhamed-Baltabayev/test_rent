const listings = [
	{
		id: 1,
		title: "Sunny Studio Near Uni",
		purpose: "rent",
		rentType: "long",
		city: "Debrecen",
		district: "University Quarter",
		size: 29,
		bedrooms: 1,
		status: "available",
		availableFrom: "2026-07-01",
		price: 168000,
		images: ["https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80"]
	},
	{
		id: 2,
		title: "Shared Flat, 2 Bedrooms",
		purpose: "rent",
		rentType: "short",
		city: "Budapest",
		district: "District XI",
		size: 61,
		bedrooms: 2,
		status: "rented",
		availableFrom: "2026-05-01",
		price: 224000,
		images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80"]
	},
	{
		id: 3,
		title: "Modern One-Bedroom Apartment",
		purpose: "rent",
		rentType: "long",
		city: "Vienna",
		district: "Leopoldstadt",
		size: 54,
		bedrooms: 1,
		status: "available",
		availableFrom: "2026-08-01",
		price: 304000,
		images: ["https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80"]
	},
	{
		id: 4,
		title: "Quiet Studio with Balcony",
		purpose: "sale",
		city: "Prague",
		district: "Vinohrady",
		size: 34,
		bedrooms: 1,
		status: "available",
		availableFrom: "2026-06-20",
		price: 256000000,
		images: ["https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80"]
	}
];

const threadList = document.getElementById("threadList");
const messagesEmpty = document.getElementById("messagesEmpty");
const chatPlaceholder = document.getElementById("chatPlaceholder");
const inlineChat = document.getElementById("inlineChat");
const inlineChatTitle = document.getElementById("inlineChatTitle");
const inlineChatFacts = document.getElementById("inlineChatFacts");
const inlineChatLink = document.getElementById("inlineChatLink");
const inlineChatLog = document.getElementById("inlineChatLog");
const inlineChatForm = document.getElementById("inlineChatForm");
const inlineChatInput = document.getElementById("inlineChatInput");
const clearChatsBtn = document.getElementById("clearChats");
const mobileMessagesQuery = window.matchMedia("(max-width: 720px)");

document.addEventListener("DOMContentLoaded", () => {
	if (inlineChatInput) {
		inlineChatInput.addEventListener("touchstart", () => {
			inlineChatInput.removeAttribute("readonly");
		}, { once: false, passive: true });
	}
});

let activeListingId = null;

function loadMessageStore() {
	const key = typeof getUserMessageStorageKey === "function" ? getUserMessageStorageKey() : null;
	if (!key) {
		return {};
	}

	try {
		const raw = localStorage.getItem(key);
		if (!raw) { return {}; }
		const parsed = JSON.parse(raw);
		return typeof parsed === "object" && parsed ? parsed : {};
	} catch {
		return {};
	}
}

function saveMessageStore(store) {
	const key = typeof getUserMessageStorageKey === "function" ? getUserMessageStorageKey() : null;
	if (!key) {
		return;
	}

	localStorage.setItem(key, JSON.stringify(store));
}

function getListingById(listingId) {
	return listings.find((l) => l.id === listingId);
}

function formatPrice(listing) {
	const amount = Number(listing.price);
	if (!Number.isFinite(amount) || amount <= 0) {
		return "N/A";
	}

	const ft = `${amount.toLocaleString("hu-HU")} Ft`;
	return listing.purpose === "sale" ? ft : `${ft}/mo`;
}

function formatListingPreviewMeta(listing) {
	const bedroomCount = Number.isFinite(Number(listing.bedrooms))
		? Number(listing.bedrooms)
		: Number.isFinite(Number(listing.rooms))
			? Number(listing.rooms)
			: null;
	const bedroomText = bedroomCount === null
		? "Bedrooms N/A"
		: `${bedroomCount} bedroom${bedroomCount === 1 ? "" : "s"}`;

	let contractText = "For sale";
	if (listing.purpose === "rent") {
		contractText = listing.rentType === "short" ? "Short-term" : "Long-term";
	}

	const sizeText = Number.isFinite(Number(listing.size)) ? `${listing.size} m2` : "Size N/A";
	return `${bedroomText} · ${contractText} · ${sizeText}`;
}

function formatAvailableFrom(dateStr) {
	if (!dateStr) {
		return null;
	}

	const date = new Date(dateStr);
	if (isNaN(date.getTime())) {
		return null;
	}

	return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function availabilityText(listing) {
	if (listing.status === "rented") {
		return "Rented out";
	}

	if (listing.status === "sold") {
		return "Sold";
	}

	const from = formatAvailableFrom(listing.availableFrom);
	return from ? `Available from ${from}` : "Available";
}

function isUnavailable(listing) {
	return listing.status === "rented" || listing.status === "sold";
}

function formatThreadPreview(entry) {
	return entry.sender === "you" ? `You: ${entry.text}` : `Landlord: ${entry.text}`;
}

function formatMessageTimestamp(timestamp) {
	if (!Number.isFinite(Number(timestamp))) {
		return "";
	}

	const date = new Date(Number(timestamp));
	if (isNaN(date.getTime())) {
		return "";
	}

	const day = date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	});
	const time = date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit"
	});

	return `${day} ${time}`;
}

function renderChatLog(conversation) {
	inlineChatLog.innerHTML = "";
	conversation.forEach((entry) => {
		const li = document.createElement("li");
		const text = document.createElement("span");
		text.className = "chat-message-text";
		const time = document.createElement("span");
		time.className = "chat-message-time";
		time.textContent = formatMessageTimestamp(entry.at);

		if (entry.sender === "you") {
			li.className = "me";
			text.textContent = `You: ${entry.text}`;
		} else {
			text.textContent = `Landlord: ${entry.text}`;
		}

		li.append(text, time);
		inlineChatLog.appendChild(li);
	});
	inlineChatLog.scrollTop = inlineChatLog.scrollHeight;
}

function openChat(listingId) {
	if (!isLoggedIn()) {
		return;
	}

	const listing = getListingById(listingId);
	if (!listing) { return; }

	activeListingId = listingId;

	const store = loadMessageStore();
	const conversation = store[String(listingId)] || [];

	inlineChatTitle.textContent = `${listing.title} — ${listing.city}`;
	inlineChatFacts.innerHTML = `
		<span class="chat-fact availability">${availabilityText(listing)}</span>
	`;
	inlineChatLink.href = `index.html?listing=${listing.id}#listing-${listing.id}`;
	renderChatLog(conversation);
	inlineChatInput.disabled = isUnavailable(listing);
	inlineChatInput.disabled = isUnavailable(listing) || !isLoggedIn();
	inlineChatInput.placeholder = isUnavailable(listing)
		? "Messaging unavailable for this listing"
		: !isLoggedIn()
		? "Log in to send messages"
		: "Write a message...";
	const sendButton = inlineChatForm.querySelector("button[type='submit']");
	if (sendButton) {
		sendButton.disabled = isUnavailable(listing) || !isLoggedIn();
	}

	chatPlaceholder.hidden = true;
	inlineChat.hidden = false;
	if (mobileMessagesQuery.matches) {
		inlineChatInput.setAttribute("readonly", "");
		inlineChatInput.blur();
	} else if (!isUnavailable(listing)) {
		inlineChatInput.removeAttribute("readonly");
		inlineChatInput.focus();
	}

	document.querySelectorAll(".thread-item").forEach((el) => el.classList.remove("is-active"));
	const active = document.querySelector(`.thread-item[data-listing-id="${listingId}"]`);
	if (active) { active.classList.add("is-active"); }
}

inlineChatForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const listing = activeListingId === null ? null : getListingById(activeListingId);
	if (!listing || isUnavailable(listing) || !isLoggedIn()) { return; }
	const text = inlineChatInput.value.trim();
	if (!text || activeListingId === null) { return; }

	const store = loadMessageStore();
	const key = String(activeListingId);
	if (!Array.isArray(store[key])) { store[key] = []; }

	store[key].push({ sender: "you", text, at: Date.now() });
	saveMessageStore(store);
	inlineChatInput.value = "";
	renderChatLog(store[key]);
	refreshThreadPreviews();
});

function refreshThreadPreviews() {
	const store = loadMessageStore();
	document.querySelectorAll(".thread-item").forEach((item) => {
		const id = Number(item.dataset.listingId);
		const conversation = store[String(id)] || [];
		const last = conversation[conversation.length - 1];
		const preview = item.querySelector(".thread-preview");
		if (preview && last) { preview.textContent = formatThreadPreview(last); }
	});
}

function renderThreads() {
	if (!isLoggedIn()) {
		threadList.innerHTML = "";
		messagesEmpty.textContent = "Log in to view your conversations.";
		messagesEmpty.hidden = false;
		inlineChat.hidden = true;
		chatPlaceholder.hidden = false;
		chatPlaceholder.textContent = "Log in to view and send messages.";
		activeListingId = null;
		clearChatsBtn.hidden = true;
		return;
	}

	clearChatsBtn.hidden = false;
	messagesEmpty.textContent = "No messages yet. Start chatting from a listing.";
	chatPlaceholder.textContent = "Select a conversation to read and reply.";

	const store = loadMessageStore();
	const threads = Object.entries(store)
		.map(([listingId, conversation]) => {
			const last = conversation[conversation.length - 1];
			return { listingId: Number(listingId), conversation, last, updatedAt: last?.at || 0 };
		})
		.filter((thread) => thread.conversation.some((entry) => entry.sender === "you"))
		.sort((a, b) => b.updatedAt - a.updatedAt);

	threadList.innerHTML = "";

	if (!threads.length) {
		messagesEmpty.hidden = false;
		return;
	}

	messagesEmpty.hidden = true;

	threads.forEach((thread) => {
		const listing = getListingById(thread.listingId);
		if (!listing || !thread.last) { return; }

		const li = document.createElement("li");
		li.className = "thread-item";
		li.dataset.listingId = String(thread.listingId);
		li.innerHTML = `
			<div class="thread-item-head">
				<strong class="thread-item-title">${listing.title}</strong>
				<span class="thread-item-price">${formatPrice(listing)}</span>
			</div>
			<p class="thread-item-meta listing-rent-type">${formatListingPreviewMeta(listing)}</p>
			<span class="thread-preview">${formatThreadPreview(thread.last)}</span>
		`;
		li.addEventListener("click", () => openChat(thread.listingId));
		threadList.appendChild(li);
	});
}

clearChatsBtn.addEventListener("click", () => {
	const key = typeof getUserMessageStorageKey === "function" ? getUserMessageStorageKey() : null;
	if (key) {
		localStorage.removeItem(key);
	}
	inlineChat.hidden = true;
	chatPlaceholder.hidden = false;
	activeListingId = null;
	renderThreads();
});

function onLoginSuccess() {
	renderThreads();
}

function onLogoutSuccess() {
	renderThreads();
}

renderThreads();
