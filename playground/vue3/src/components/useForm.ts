import { type RegleRoot } from '@regle/core'

type FormComposable = {
  r$?: RegleRoot<Record<string, any>, any, any, any>
}

const useForm = ({ r$ }: FormComposable = {}) => {
  const isFieldInvalid = (fieldName: string): boolean => {
    const fields = r$?.$fields
    const fieldValidation = fields?.[fieldName as keyof typeof fields]

    return !!fieldValidation?.$invalid
  }

  return {
    isFieldInvalid,
  }
}

export default useForm
