import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github_token', { required: true })
    const octokit = github.getOctokit(githubToken)

    const pullRequestPattern = core.getInput('pull_request_pattern', {
      required: true
    })

    const pullRequestDescription =
      github.context.payload.pull_request?.body ?? ""

    // Añadimos logs para debuggear
    core.debug('Pattern: ' + pullRequestPattern)
    core.debug('Description: ' + JSON.stringify(pullRequestDescription))
    core.debug('Description length: ' + pullRequestDescription.length)
    core.debug('Description bytes: ' + [...pullRequestDescription].map(c => c.charCodeAt(0)).join(','))


    const pullRequestPatternRegex = new RegExp(pullRequestPattern, 's')

    const issue_number = github.context.payload.pull_request?.number

    if (!pullRequestPatternRegex.test(pullRequestDescription)) {
      core.info('La descripción del PR no cumple con el formato requerido. Por favor, revisa el patrón solicitado.')

      await octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: issue_number!,
        body: '❌ La descripción del PR no cumple con el formato requerido. Por favor, revisa el patrón solicitado.'
      })

      return
    }

    core.info('La descripción del PR cumple con el formato requerido. ¡Buen trabajo!')

    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: issue_number!,
      body: '✅ La descripción del PR cumple con el formato requerido. ¡Buen trabajo!'
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
