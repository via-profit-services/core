export default (props: Props) => {
  const { name, message } = props;

  return {
    errors: [
      {
        name: name || 'Unknown Error',
        message: message || name || 'Unknown Error',
      },
    ],
  };
};

interface Props {
  name?: string;
  message?: string;
}
