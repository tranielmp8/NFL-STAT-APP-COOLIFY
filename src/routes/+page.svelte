<script lang="ts">
	import type { PageServerData } from './$types';

	type Team = {
		abbreviation: string;
		name: string;
		city: string;
		conference: string;
		division: string;
		colorPrimary: string | null;
		colorSecondary: string | null;
		logoUrl: string | null;
	};

	let { data }: { data: PageServerData & { teams: Team[] } } = $props();
	let selectedConference = $state<'AFC' | 'NFC'>('AFC');

	const divisionOrder = ['East', 'North', 'South', 'West'];

	const visibleTeams = $derived(
		data.teams.filter((team) => team.conference === selectedConference)
	);

	const divisions = $derived(
		divisionOrder.map((name) => ({
			name: `${selectedConference} ${name}`,
			teams: visibleTeams.filter((team) => team.division === `${selectedConference} ${name}`)
		}))
	);

	const leaderBlocks = $derived([
		{ label: 'Passing', category: 'passing', rows: data.leaderPreview.passing },
		{ label: 'Rushing', category: 'rushing', rows: data.leaderPreview.rushing },
		{ label: 'Receiving', category: 'receiving', rows: data.leaderPreview.receiving }
	]);
</script>

<svelte:head>
	<title>GridIron NFL Stats</title>
	<meta
		name="description"
		content="Browse all 32 NFL teams, rosters, schedules, and player stats."
	/>
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
					<div class="text-xs tracking-widest text-[#8a909e] uppercase">NFL Stats Desk</div>
				</div>
			</a>

			<nav class="hidden items-center gap-6 text-sm font-semibold text-[#8a909e] md:flex">
				<a class="transition hover:text-white" href="#teams">Teams</a>
				<a class="transition hover:text-white" href="/players">Players</a>
				<a class="transition hover:text-white" href="/leaders">Leaders</a>
				{#if data.role === 'admin'}
					<a class="transition hover:text-white" href="/admin/settings">Admin</a>
				{/if}
				{#if data.user}
					<a class="transition hover:text-white" href="/account">Account</a>
				{:else}
					<a class="transition hover:text-white" href="/auth/login">Sign In</a>
				{/if}
			</nav>
		</div>
	</header>

	<section class="border-b border-white/10 bg-[#161921]">
		<div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
			<div>
				<div
					class="mb-4 inline-flex items-center gap-2 rounded border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#f5a623] uppercase"
				>
					{data.activeSeason}
					{data.activeSeasonType}
				</div>
				<h1 class="max-w-3xl text-4xl leading-tight font-black md:text-6xl">
					NFL stats, leaders, rosters, and schedules in one place.
				</h1>
				<p class="mt-5 max-w-2xl text-base leading-7 text-[#aeb4c0]">
					Browse every franchise, search synced players, and compare league leaders for the active
					season.
				</p>
				<form class="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row" method="get" action="/players">
					<input
						class="min-h-12 flex-1 border-white/10 bg-[#0d0f14] px-4 text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
						name="q"
						placeholder="Search player, team, or position"
					/>
					<button
						class="min-h-12 bg-[#f5a623] px-6 text-sm font-black tracking-wide text-[#11151d] uppercase transition hover:bg-[#ffbd4a]"
					>
						Search Players
					</button>
				</form>
			</div>

			<div class="grid grid-cols-3 gap-3">
				<div class="border border-white/10 bg-[#0d0f14] p-4">
					<div class="text-3xl font-black text-white">{data.teams.length}</div>
					<div class="mt-1 text-xs font-bold tracking-widest text-[#8a909e] uppercase">Teams</div>
				</div>
				<div class="border border-white/10 bg-[#0d0f14] p-4">
					<div class="text-3xl font-black text-white">{data.health.players}</div>
					<div class="mt-1 text-xs font-bold tracking-widest text-[#8a909e] uppercase">Players</div>
				</div>
				<div class="border border-white/10 bg-[#0d0f14] p-4">
					<div class="text-3xl font-black text-white">{data.health.activeSeasonStatRows}</div>
					<div class="mt-1 text-xs font-bold tracking-widest text-[#8a909e] uppercase">
						Stat Rows
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-white/10 bg-[#0d0f14]">
		<div class="mx-auto max-w-7xl px-4 py-10">
			<div class="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
				<div>
					<h2 class="text-2xl font-black">League Leader Snapshot</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						Top synced leaders for {data.activeSeason}
						{data.activeSeasonType}.
					</p>
				</div>
				<a
					href={`/leaders?season=${data.activeSeason}&type=${data.activeSeasonType}`}
					class="bg-[#f5a623] px-4 py-3 text-sm font-black text-[#11151d] transition hover:bg-[#ffbd4a]"
				>
					View All Leaders
				</a>
			</div>

			<div class="grid gap-4 lg:grid-cols-3">
				{#each leaderBlocks as block}
					<article class="border border-white/10 bg-[#161921] p-5">
						<div class="mb-4 flex items-center justify-between gap-3">
							<h3 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">
								{block.label}
							</h3>
							<a
								class="text-xs font-black tracking-widest text-[#8a909e] uppercase transition hover:text-white"
								href={`/leaders?category=${block.category}&season=${data.activeSeason}&type=${data.activeSeasonType}`}
							>
								More
							</a>
						</div>
						{#if block.rows.length}
							<div class="space-y-3">
								{#each block.rows as row, index}
									<a
										class="flex items-center justify-between gap-3 border border-white/10 bg-[#0d0f14] p-3 transition hover:border-[#f5a623]/50"
										href={`/teams/${row.team.abbreviation.toLowerCase()}/players/${row.player.id}?season=${data.activeSeason}&type=${data.activeSeasonType}`}
									>
										<div class="flex min-w-0 items-center gap-3">
											<div class="w-7 text-center text-lg font-black text-[#f5a623]">
												{index + 1}
											</div>
											<div class="min-w-0">
												<div class="truncate font-black text-white">{row.player.name}</div>
												<div class="text-xs text-[#8a909e]">
													{row.team.abbreviation} / {row.player.position}
												</div>
											</div>
										</div>
										<div class="shrink-0 text-xl font-black text-white">
											{typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
										</div>
									</a>
								{/each}
							</div>
						{:else}
							<div
								class="border border-dashed border-white/15 bg-[#0d0f14] p-6 text-sm text-[#8a909e]"
							>
								No synced leaders yet.
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section id="teams" class="mx-auto max-w-7xl px-4 py-10">
		<div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
			<div>
				<h2 class="text-2xl font-black">All Franchises</h2>
				<p class="mt-1 text-sm text-[#8a909e]">Select a conference to browse teams by division.</p>
			</div>

			<div class="grid w-full grid-cols-2 border border-white/10 bg-[#161921] p-1 md:w-56">
				{#each ['AFC', 'NFC'] as conference}
					<button
						type="button"
						class={[
							'px-4 py-2 text-sm font-black transition',
							selectedConference === conference
								? 'bg-[#f5a623] text-[#11151d]'
								: 'text-[#8a909e] hover:text-white'
						]}
						onclick={() => (selectedConference = conference as 'AFC' | 'NFC')}
					>
						{conference}
					</button>
				{/each}
			</div>
		</div>

		<div class="grid gap-5 lg:grid-cols-2">
			{#each divisions as division}
				<section class="border border-white/10 bg-[#161921] p-5">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">
							{division.name}
						</h3>
						<span class="text-xs font-bold text-[#8a909e]">{division.teams.length} teams</span>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						{#each division.teams as team}
							<a
								href={`/teams/${team.abbreviation.toLowerCase()}`}
								class="group flex min-h-24 items-center gap-4 border border-white/10 bg-[#0d0f14] p-4 transition hover:-translate-y-0.5 hover:border-[#f5a623]/50"
								style={`--team-primary: ${team.colorPrimary ?? '#f5a623'}; --team-secondary: ${team.colorSecondary ?? '#8a909e'};`}
							>
								<div
									class="flex h-14 w-14 shrink-0 items-center justify-center border border-white/10 bg-white p-2"
								>
									{#if team.logoUrl}
										<img class="max-h-full max-w-full object-contain" src={team.logoUrl} alt="" />
									{:else}
										<span class="text-xs font-black text-[#11151d]">{team.abbreviation}</span>
									{/if}
								</div>
								<div class="min-w-0">
									<div
										class="text-xs font-black tracking-widest text-[var(--team-secondary)] uppercase"
									>
										{team.abbreviation}
									</div>
									<div class="truncate text-lg font-black text-white group-hover:text-[#f5a623]">
										{team.city}
										{team.name}
									</div>
									<div class="mt-1 h-1.5 w-24 bg-[var(--team-primary)]"></div>
								</div>
							</a>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</section>
</main>
