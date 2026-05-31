<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Account | GridIron</title>
</svelte:head>

<main class="min-h-screen bg-[#0d0f14] px-4 py-10 text-[#f0f2f5]">
	<section class="mx-auto max-w-3xl border border-white/10 bg-[#161921] p-6">
		<a
			href="/"
			class="text-xs font-black tracking-widest text-[#8a909e] uppercase transition hover:text-white"
		>
			Back to teams
		</a>

		<div class="mt-8">
			<h1 class="text-3xl font-black">Account</h1>
			<p class="mt-2 text-sm text-[#aeb4c0]">Signed in as {data.user.email}</p>
		</div>

		<div class="mt-6 border border-white/10 bg-[#0d0f14] p-4">
			<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Name</div>
			<div class="mt-1 text-lg font-black">{data.user.name}</div>
		</div>

		<div class="mt-4 border border-white/10 bg-[#0d0f14] p-4">
			<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Role</div>
			<div class="mt-1 text-lg font-black capitalize">{data.role}</div>
			{#if data.role !== 'admin'}
				<p class="mt-2 text-sm leading-6 text-[#aeb4c0]">
					Admin pages require this account to have the admin role.
				</p>
			{/if}
		</div>

		{#if data.role === 'admin'}
			<a
				class="mt-6 inline-flex bg-white px-4 py-3 font-black text-[#11151d] transition hover:bg-[#dfe3ea]"
				href="/admin/settings"
			>
				Admin Settings
			</a>
		{/if}

		<form class="mt-6" method="post" action="?/signOut" use:enhance>
			<button
				class="bg-[#f5a623] px-4 py-3 font-black text-[#11151d] transition hover:bg-[#ffbd4a]"
			>
				Sign Out
			</button>
		</form>
	</section>
</main>
