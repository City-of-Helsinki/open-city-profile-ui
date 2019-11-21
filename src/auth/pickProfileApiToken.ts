// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(obj: Record<string, any>) {
  return obj[process.env.REACT_APP_PROFILE_AUDIENCE as string];
}
