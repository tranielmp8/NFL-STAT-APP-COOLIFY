<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Player Search | GridIron</title>
</svelte:head>

<main class="min-h-screen bg-[#0d0f14] text-[#f0f2f5]">
	<header class="border-b border-white/10 bg-[#11151d]">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
			<a href="/" class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded bg-[#f5a623] text-sm font-black text-[#11151d]"
				>
					NFL
				</div>
				<div>
					<div class="text-lg font-black tracking-wide uppercase">GridIron</div>
					<div class="text-xs tracking-widest text-[#8a909e] uppercase">Player Search</div>
				</div>
			</a>

			<nav class="hidden items-center gap-6 text-sm font-semibold text-[#8a909e] md:flex">
				<a class="transition hover:text-white" href="/">Teams</a>
				<a class="text-[#f5a623]" href="/players">Players</a>
				<a class="transition hover:text-white" href="/leaders">Leaders</a>
				{#if data.role === 'admin'}
					<a class="transition hover:text-white" href="/admin/settings">Admin</a>
				{/if}
			</nav>
		</div>
	</header>

	<section class="border-b border-white/10 bg-[#161921]">
		<div class="mx-auto max-w-7xl px-4 py-10">
			<h1 class="text-4xl font-black md:text-5xl">Find Players</h1>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-[#aeb4c0]">
				Search by player, position, team abbreviation, or team name.
			</p>

			<form class="mt-6 flex flex-col gap-3 sm:flex-row" method="get">
				<input
					class="min-h-12 flex-1 border-white/10 bg-[#0d0f14] px-4 text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
					name="q"
					placeholder="Search players, teams, or positions"
					value={data.query}
				/>
				<button
					class="min-h-12 bg-[#f5a623] px-6 text-sm font-black tracking-wide text-[#11151d] uppercase transition hover:bg-[#ffbd4a]"
				>
					Search
				</button>
			</form>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-4 py-10">
		<div class="mb-5 flex items-end justify-between gap-4">
			<div>
				<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">Results</h2>
				<p class="mt-1 text-sm text-[#8a909e]">
					{data.query
						? `${data.players.length} matches for "${data.query}"`
						: 'Enter a search above.'}
				</p>
			</div>
		</div>

		{#if data.players.length}
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.players as player}
					<a
						href={`/teams/${player.team.abbreviation.toLowerCase()}/players/${player.id}`}
						class="group flex min-h-28 items-center gap-4 border border-white/10 bg-[#161921] p-4 transition hover:-translate-y-0.5 hover:border-[#f5a623]/50"
						style={`--team-secondary: ${player.team.colorSecondary ?? '#8a909e'};`}
					>
						<div
							class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white"
						>
							{#if player.headshotUrl}
								<img class="h-full w-full object-cover" src={player.headshotUrl} alt="" />
							{:else if player.team.logoUrl}
								<img
									class="max-h-full max-w-full object-contain p-2"
									src={player.team.logoUrl}
									alt=""
								/>
							{:else}
								<span class="text-xs font-black text-[#11151d]">{player.position}</span>
							{/if}
						</div>

						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<span
									class="text-xs font-black tracking-widest text-[var(--team-secondary)] uppercase"
								>
									{player.team.abbreviation}
								</span>
								<span class="text-xs font-bold text-[#8a909e]">
									{player.position}{player.jersey ? ` #${player.jersey}` : ''}
								</span>
							</div>
							<div class="truncate text-lg font-black text-white group-hover:text-[#f5a623]">
								{player.name}
							</div>
							<div class="mt-1 text-xs text-[#8a909e]">
								{player.team.city}
								{player.team.name}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else if data.query}
			<div class="border border-dashed border-white/15 bg-[#161921] p-10 text-center">
				<div class="text-sm font-bold text-[#aeb4c0]">No players matched your search.</div>
			</div>
		{/if}
	</section>
</main>
