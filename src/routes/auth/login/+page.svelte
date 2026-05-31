<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let mode = $state<'sign-in' | 'sign-up'>('sign-in');
</script>

<svelte:head>
	<title>{mode === 'sign-in' ? 'Sign In' : 'Sign Up'} | GridIron</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-[#0d0f14] px-4 text-[#f0f2f5]">
	<section class="w-full max-w-md border border-white/10 bg-[#161921] p-6">
		<a
			href="/"
			class="text-xs font-black tracking-widest text-[#8a909e] uppercase transition hover:text-white"
		>
			Back to teams
		</a>

		<div class="mt-6">
			<h1 class="text-3xl font-black">{mode === 'sign-in' ? 'Sign In' : 'Create Account'}</h1>
			<p class="mt-2 text-sm leading-6 text-[#aeb4c0]">
				Use email and password authentication for your GridIron account.
			</p>
		</div>

		<div class="mt-6 grid grid-cols-2 border border-white/10 bg-[#0d0f14] p-1">
			<button
				type="button"
				class={[
					'px-4 py-2 text-sm font-black transition',
					mode === 'sign-in' ? 'bg-[#f5a623] text-[#11151d]' : 'text-[#8a909e] hover:text-white'
				]}
				onclick={() => (mode = 'sign-in')}
			>
				Sign In
			</button>
			<button
				type="button"
				class={[
					'px-4 py-2 text-sm font-black transition',
					mode === 'sign-up' ? 'bg-[#f5a623] text-[#11151d]' : 'text-[#8a909e] hover:text-white'
				]}
				onclick={() => (mode = 'sign-up')}
			>
				Sign Up
			</button>
		</div>

		<form
			class="mt-6 space-y-4"
			method="post"
			action={mode === 'sign-in' ? '?/signInEmail' : '?/signUpEmail'}
			use:enhance
		>
			{#if mode === 'sign-up'}
				<label class="block">
					<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Name</span>
					<input
						name="name"
						required
						class="mt-2 w-full border border-white/10 bg-[#0d0f14] px-3 py-3 text-white transition outline-none focus:border-[#f5a623]"
					/>
				</label>
			{/if}

			<label class="block">
				<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Email</span>
				<input
					type="email"
					name="email"
					required
					class="mt-2 w-full border border-white/10 bg-[#0d0f14] px-3 py-3 text-white transition outline-none focus:border-[#f5a623]"
				/>
			</label>

			<label class="block">
				<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Password</span>
				<input
					type="password"
					name="password"
					required
					minlength="8"
					class="mt-2 w-full border border-white/10 bg-[#0d0f14] px-3 py-3 text-white transition outline-none focus:border-[#f5a623]"
				/>
			</label>

			{#if mode === 'sign-up'}
				<label class="block">
					<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase"
						>Confirm Password</span
					>
					<input
						type="password"
						name="confirmPassword"
						required
						minlength="8"
						class="mt-2 w-full border border-white/10 bg-[#0d0f14] px-3 py-3 text-white transition outline-none focus:border-[#f5a623]"
					/>
				</label>
			{/if}

			{#if form?.message}
				<p class="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
					{form.message}
				</p>
			{/if}

			<button
				class="w-full bg-[#f5a623] px-4 py-3 font-black text-[#11151d] transition hover:bg-[#ffbd4a]"
			>
				{mode === 'sign-in' ? 'Sign In' : 'Create Account'}
			</button>
		</form>
	</section>
</main>
