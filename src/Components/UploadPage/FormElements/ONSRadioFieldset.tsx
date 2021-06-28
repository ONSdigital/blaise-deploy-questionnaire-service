import React, {Fragment, ReactElement} from "react";
import {Field, useFormikContext} from "formik";
import {InputErrorPanel} from "./InputField";

interface Props {
    description: string,
    name: string,
    radioOptions: any[],
    props: Pick<any, string | number | symbol>
}

function RadioFieldset({description, name, radioOptions, ...props}: Props): ReactElement {
    return <fieldset className="fieldset">
        <legend className="fieldset__legend">
            {description}
        </legend>
        <div className="radios__items" id={name}>
            {
                (
                    radioOptions && radioOptions.length > 0 &&
                    radioOptions.map((radioOption: any) => {
                        return (
                            <Fragment key={radioOption.id}>
                                <p className="radios__item">
                                    <span className="radio">
                                        <Field type="radio"
                                               id={radioOption.id}
                                               name={name}
                                               value={radioOption.value}
                                               className="radio__input js-radio" {...props}/>
                                        <label className="radio__label"
                                               htmlFor={radioOption.id}
                                               id={`${radioOption.id}-label`}>{radioOption.label}
                                      </label>
                                        {
                                            radioOption.specifyOption && (
                                                <span className="radio__other radio__other--open"
                                                      id="other-radio-other-wrap">
                                                    <label className="label u-fs-s--b "
                                                           htmlFor={radioOption.specifyOption.id}
                                                           id="other-textbox-label">
                                                        {radioOption.specifyOption.description}
                                                    </label>
                                                    <Field type={radioOption.specifyOption.type}
                                                           id={radioOption.specifyOption.id}
                                                           name={radioOption.specifyOption.name}
                                                           validate={radioOption.specifyOption.validate}
                                                           min={radioOption.specifyOption.min}
                                                           className="input input--text input-type__input input--w-auto"
                                                           />
                                                </span>
                                            )
                                        }
                                        </span>
                                </p>
                                <br/>
                            </Fragment>
                        );
                    })
                )
            }
        </div>
    </fieldset>;
}

export const ONSRadioFieldset = ({name, description, radioOptions, ...props}: any): ReactElement => {
    const {errors}: any = useFormikContext();

    return (
        <Fragment key={name}>
            {
                errors[name] ?
                    InputErrorPanel(
                        errors[name],
                        "name",
                        <RadioFieldset description={description} name={name} radioOptions={radioOptions}
                                       {...props}/>
                    )
                    :
                    <RadioFieldset description={description} name={name} radioOptions={radioOptions} {...props}/>
            }
        </Fragment>
    );
};
