import React, { useState, useEffect, FormEvent } from "react";
import logoImg from '../../assets/virus.svg';

import { Title, Form, Repositories, Error } from './styles';

import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  }
}
const Dashboard: React.FC = () => {

  const [newRepo, setNewRepo] = useState('');

  const [inputError, setInputError] = useState('')

  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      '@GithubExplorer:repositories',
    );
    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    }
    return [];
  });

  useEffect(() => {
    //para não conflitar com outras aplicações que estão rodando no localhost, porque o localstore é por endereço e isso não seja compoartilhado é bom que faça assim:
    //@nomeDaSuaAplicação:nomedainformacaoquegravarnolocalstorage

    localStorage.setItem('@GithubExplorer:repositories', JSON.stringify(repositories))
  }, [repositories]);


  async function addRepository(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputError('Adicione um repositório');
      return;
    }

    try {
      const response = await api.get<Repository>(`repos/${newRepo}`);
      const repository = response.data;


      const searchRepository = repositories.map(repo =>
        repo.full_name.includes(repository.full_name),

      );
      if (searchRepository != null) { setInputError('Esse repositório já foi adicionado'); return; }


      if (repository.full_name.includes("COVID-19") || repository.full_name.includes("covid19")) {
        console.log(repository);
        setRepositories([...repositories, repository]);
        setNewRepo('');
        setInputError('');

      } else {
        setInputError("Não há relação com o covid19")
      }


    }

    catch {
      setInputError('Tente novamente');
    }

  }


  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>
        <p>Adicione em sua lista repositórios relacionados ao covid-19.</p>

      </Title>
      <p>Abra uma "issue" e contribua para comunidade.</p>
      <Form hasError={!!inputError} onSubmit={addRepository} >
        <input
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          placeholder=" 
            Ex: autor/repositoryCovid19"
        />
        <button type="submit"> Add</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map((repository) => (
          <Link key={repository.full_name}
            to={`/repositories/${repository.full_name}`}>
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p> {repository.description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>

        ))}

      </Repositories>
    </>
  )
}

export default Dashboard;
